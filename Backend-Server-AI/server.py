from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from ultralytics import YOLO
import cv2
from io import BytesIO
from PIL import Image

app = FastAPI()
model = YOLO("model.pt")  # YOLO nano, ringan buat CPU

# ================== POST API untuk menerima frame dari Pi ==================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img = Image.open(BytesIO(await file.read()))
    results = model.predict(img)
    return {"prediction": results[0].boxes.data.tolist()}

# ================== MJPEG streaming langsung dari server ==================
def gen():
    cap = cv2.VideoCapture(0)  # bisa pakai USB camera di server
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        results = model.predict(frame)

        # overlay bounding box
        for box in results[0].boxes.xyxy:
            x1, y1, x2, y2 = map(int, box)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        _, jpeg = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
