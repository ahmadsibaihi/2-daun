import cv2
import requests

SERVER_URL = "http://192.168.100.237:8000/predict"  # ganti <server_ip> sesuai server

cap = cv2.VideoCapture(0)  # 0 = default camera

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    # encode frame ke JPEG
    _, img_encoded = cv2.imencode('.jpg', frame)

    # kirim frame ke backend server
    try:
        response = requests.post(SERVER_URL, files={"file": img_encoded.tobytes()})
        print(response.json())
    except Exception as e:
        print("Error:", e)

    # optional: tampilkan frame di Pi / Windows
    cv2.imshow("Camera", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
