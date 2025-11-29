from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi import Body
from pydantic import BaseModel
from ultralytics import YOLO
import cv2
from io import BytesIO
from PIL import Image
import threading
import time
import numpy as np
import mysql.connector
import hashlib
import secrets
from dotenv import load_dotenv
import os
from datetime import datetime
import json

# ================= LOAD ENV =================
load_dotenv()
App_PORT = int(os.getenv("APP_PORT", 5656))
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
SECRET_KEY = os.getenv("SECRET_KEY")
MODEL_PATH = os.getenv("MODEL_PATH")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

# ================= INIT =================
app = FastAPI()
model = YOLO(MODEL_PATH)
latest_frame = None
frame_lock = threading.Lock()
CAPTURE_DIR = "captures"
os.makedirs(CAPTURE_DIR, exist_ok=True)

# ================= DATABASE =================
def get_db():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

def hash_password(password: str):
    return hashlib.sha256((password + SECRET_KEY).encode()).hexdigest()

def verify_token(token: str):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE token=%s", (token,))
    user = cursor.fetchone()
    db.close()
    return user is not None

def token_auth(token: str = Header(...)):
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

def private_key_auth(private_key: str = Header(...)):
    if private_key != os.getenv("PRIVATE_KEY"):
        raise HTTPException(status_code=401, detail="Invalid private key")
    return private_key

def auth_either(token: str = Header(None), private_key: str = Header(None)):
    valid_token = False
    valid_key = False

    # cek token
    if token:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT id FROM users WHERE token=%s", (token,))
        if cursor.fetchone():
            valid_token = True
        db.close()
    
    # cek private key
    if private_key and private_key == PRIVATE_KEY:
        valid_key = True

    if not (valid_token or valid_key):
        raise HTTPException(status_code=401, detail="Unauthorized: token or private key required")
    
    return {"token": token, "private_key": private_key}

# ================= Pydantic Models =================
class AuthData(BaseModel):
    username: str
    password: str

# ================= AUTH =================
@app.post("/register")
async def register(data: AuthData):
    username = data.username
    password = data.password

    db = get_db()
    cursor = db.cursor()
    hashed = hash_password(password)
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed))
        db.commit()
    except mysql.connector.IntegrityError:
        db.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    db.close()
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(data: AuthData):
    username = data.username
    password = data.password

    db = get_db()
    cursor = db.cursor()
    hashed = hash_password(password)
    cursor.execute("SELECT id FROM users WHERE username=%s AND password=%s", (username, hashed))
    user = cursor.fetchone()
    if not user:
        db.close()
        raise HTTPException(status_code=401, detail="Invalid username/password")

    token = secrets.token_hex(16)
    cursor.execute("UPDATE users SET token=%s WHERE id=%s", (token, user[0]))
    db.commit()
    db.close()
    return {"token": token}

# ================= PREDICT STREAM =================
@app.post("/predict_stream")
async def predict_stream(file: UploadFile = File(...), auth=Depends(auth_either)):
    global latest_frame
    frame = None
    results = None

    try:
        img_bytes = await file.read()
        img = Image.open(BytesIO(img_bytes))
        results = model.predict(img)

        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        for box in results[0].boxes.xyxy:
            if len(box) < 4:
                continue
            x1, y1, x2, y2 = map(int, box)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    except Exception as e:
        print("Error processing image:", e)
        if frame is None:
            frame = np.zeros((480, 640, 3), dtype=np.uint8)

    if frame is not None:
        with frame_lock:
            latest_frame = frame.copy()

    try:
        preds = results[0].boxes.data.tolist()
    except:
        preds = []

    return {"prediction": preds}

# ================= CAPTURE FRAME =================
@app.post("/capture")
def capture(token: str = Depends(token_auth)):
    global latest_frame
    if latest_frame is None:
        raise HTTPException(status_code=400, detail="No frame available to capture")

    # simpan frame ke file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    filename = os.path.join(CAPTURE_DIR, f"{timestamp}.jpg")
    cv2.imwrite(filename, latest_frame)

    # ambil prediksi terakhir
    try:
        # misal kita simpan prediksi terakhir juga
        preds = getattr(latest_frame, "preds", [])
    except:
        preds = []

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO captures (filename, prediction) VALUES (%s, %s)",
        (filename, json.dumps(preds))
    )
    db.commit()
    db.close()

    return {"message": "Frame captured successfully", "filename": filename, "prediction": preds}

# ================= GET DATA CAPTURE =================
@app.get("/captures")
def get_captures(token: str = Depends(token_auth)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM captures ORDER BY created_at DESC")
    captures = cursor.fetchall()
    db.close()

    # map filename ke URL publik
    for cap in captures:
        cap["file_url"] = f"/captures/{os.path.basename(cap['filename'])}"
        cap["prediction"] = json.loads(cap["prediction"])
        cap["description"] = json.loads(cap["description"]) if cap["description"] else {}

    return {"captures": captures}

# ================= UPDATE DESCRIPTION =================
@app.put("/captures/{capture_id}")
def update_capture(capture_id: int, description: dict = Body(...), token: str = Depends(token_auth)):
    db = get_db()
    cursor = db.cursor()
    
    # pastikan capture ada
    cursor.execute("SELECT id FROM captures WHERE id=%s", (capture_id,))
    capture = cursor.fetchone()
    if not capture:
        db.close()
        raise HTTPException(status_code=404, detail="Capture not found")
    
    # update kolom description
    cursor.execute(
        "UPDATE captures SET description=%s WHERE id=%s",
        (json.dumps(description), capture_id)
    )
    db.commit()
    db.close()
    
    return {"message": "Description updated successfully", "capture_id": capture_id, "description": description}

# ================= MJPEG STREAM =================
def gen():
    global latest_frame
    while True:
        if latest_frame is None:
            time.sleep(0.01)
            continue
        with frame_lock:
            _, jpeg = cv2.imencode('.jpg', latest_frame)
            frame_bytes = jpeg.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.03)

@app.get("/video_feed")
def video_feed(token: str = Depends(token_auth)):
    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/")
def read_root():
    return {
        "app_name": "YOLO AI Backend Kenali Daun",
        "message": "Welcome to the YOLO AI Backend Server",
        "endpoints": {
            "/register": "POST - Register a new user (JSON body)",
            "/login": "POST - Login and get token (JSON body)",
            "/predict_stream": "POST - Predict objects in uploaded image (Header: token)",
            "/video_feed": "GET - MJPEG video feed of latest frame (Header: token)"
        }
    }

# ================= PROFILE =================
@app.get("/profile")
def profile(token: str = Depends(token_auth)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, username FROM users WHERE token=%s", (token,))
    user = cursor.fetchone()
    db.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user[0], "username": user[1]}

app.mount("/captures", StaticFiles(directory=CAPTURE_DIR), name="captures")

# ================= DATABASE =================
def create_db_and_table():
    temp_conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD
    )
    temp_cursor = temp_conn.cursor()
    temp_cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    temp_conn.commit()
    temp_conn.close()

    db = get_db()
    cursor = db.cursor()
    # buat tabel users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        token VARCHAR(255)
    )
    """)
    # buat tabel captures
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS captures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        prediction JSON,
        description JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
    """)
    db.commit()
    db.close()

# ================= RUN =================
if __name__ == "__main__":
    import uvicorn
    print("Server running on http://0.0.0.0:", App_PORT)
    create_db_and_table()
    uvicorn.run(app, host="0.0.0.0", port=App_PORT)
