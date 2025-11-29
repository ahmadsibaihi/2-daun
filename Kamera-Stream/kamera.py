# Kamera-Stream/kamera.py
import cv2
import requests
import numpy as np

SERVER_URL = "http://127.0.0.1:5656/predict_stream"  # ganti sesuai IP server
PRIVATE_KEY = "kelompokdua456"  # samain dengan server

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Camera tidak terbaca!")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    # encode frame ke JPEG
    _, img_encoded = cv2.imencode('.jpg', frame)
    img_bytes = img_encoded.tobytes()

    # kirim frame ke backend dengan format yang benar
    files = {"file": ("frame.jpg", img_bytes, "image/jpeg")}
    headers = {"private-key": PRIVATE_KEY} 

    try:
        response = requests.post(SERVER_URL, files=files, headers=headers, timeout=5)
        if response.status_code == 200:
            # pastikan response JSON valid
            try:
                preds = response.json().get("prediction", [])
            except Exception as e:
                print("Error parsing JSON:", e)
                preds = []
        else:
            print("Server error:", response.status_code, response.text)
            preds = []

        # overlay bounding box di client
        for box in preds:
            # pastikan box minimal 6 elemen
            if len(box) < 6:
                continue
            x1, y1, x2, y2, conf, cls = map(float, box[:6])
            x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(frame, f"{conf:.2f}", (x1, y1-5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,255), 2)

    except requests.exceptions.RequestException as e:
        print("Connection error:", e)

    # tampilkan frame realtime di GUI Windows
    cv2.imshow("Camera YOLO", frame)

    # tekan 'q' untuk keluar
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
