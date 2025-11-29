# Backend-Server-AI/server.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from ultralytics import YOLO
import cv2
from io import BytesIO
from PIL import Image
import threading
import time
import numpy as np   # wajib biar np.array dan np.zeros works

app = FastAPI()
model = YOLO("model.pt")  # pastikan model.pt ada di folder

# ================== SIMPAN FRAME TERBARU ==================
latest_frame = None
frame_lock = threading.Lock()

# ================== PREDICT STREAM ==================
@app.post("/predict_stream")
async def predict_stream(file: UploadFile = File(...)):
    global latest_frame
    frame = None
    results = None

    try:
        img_bytes = await file.read()
        img = Image.open(BytesIO(img_bytes))
        results = model.predict(img)

        # overlay bounding box ke frame
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        for box in results[0].boxes.xyxy:
            if len(box) < 4:
                continue
            x1, y1, x2, y2 = map(int, box)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    except Exception as e:
        print("Error processing image:", e)
        # fallback frame hitam
        if frame is None:
            frame = np.zeros((480, 640, 3), dtype=np.uint8)

    # simpan frame terbaru
    if frame is not None:
        with frame_lock:
            latest_frame = frame.copy()

    # ambil prediksi jika ada
    try:
        preds = results[0].boxes.data.tolist()
    except:
        preds = []

    return {"prediction": preds}

# ================== MJPEG STREAMING ==================
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
        time.sleep(0.03)  # ~30fps

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

# ================== RUN SERVER ==================
if __name__ == "__main__":
    import uvicorn
    print("Server running on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
