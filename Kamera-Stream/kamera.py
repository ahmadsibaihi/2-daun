import cv2
import requests
import numpy as np

SERVER_URL = "http://127.0.0.1:8000/predict"  # ganti sesuai IP server

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

    # kirim frame ke backend server
    try:
        response = requests.post(SERVER_URL, files={"file": img_encoded.tobytes()})
        preds = response.json()["prediction"]

        # overlay bounding box di client juga
        for box in preds:
            x1, y1, x2, y2, conf, cls = map(int, box[:4]) + [box[4], box[5]]
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0,0,255), 2)
            cv2.putText(frame, f"{conf:.2f}", (x1, y1-5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,255), 2)

    except Exception as e:
        print("Error:", e)

    # tampilkan frame realtime di GUI Windows
    cv2.imshow("Camera YOLO", frame)

    # tekan 'q' untuk keluar
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
