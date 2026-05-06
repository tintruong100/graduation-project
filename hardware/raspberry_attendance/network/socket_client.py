import base64
import json
import os
import queue
import threading
import socketio
import adafruit_fingerprint
from datetime import datetime

from config import SERVER_URL, FILE_EMPLOYEES, PI_SECRET_KEY
from hardware.lcd import display_message
from storage.local_db import load_local_employees, sync_offline_logs, save_offline_log
from hardware.indicators import turn_off_all, success_signal, fail_signal

sio = socketio.Client()
task_queue = queue.Queue()
# upload_queue = queue.Queue()
finger_instance = None


# def enqueue_attendance(log_data):
#     upload_queue.put(log_data)


def _prepare_payload(log_data):
    payload = dict(log_data)

    if payload.get("image_data") is None:
        image_path = payload.get("image_path")
        if image_path and os.path.exists(image_path):
            with open(image_path, "rb") as f:
                payload["image_data"] = base64.b64encode(f.read()).decode("utf-8")
        else:
            payload["image_data"] = None

    return payload


@sio.event
def connect():
    print("\n✅ Đã kết nối Socket.IO tới Server!")
    sio.emit("request_sync_data")
    sync_offline_logs(sio)
    display_message("ONLINE MODE", "")
    success_signal()


@sio.event
def disconnect():
    print("\n⚠️ Mất kết nối Socket.IO! (Chuyển sang chế độ Offline)")
    display_message("OFFLINE MODE", "")
    fail_signal()


@sio.on("sync_data_response")
def on_sync_data(data):
    old_employees = load_local_employees()
    old_ids = {
        str(emp.get("sensor_id"))
        for emp in old_employees
        if emp.get("sensor_id") is not None
    }
    new_ids = {
        str(emp.get("sensor_id"))
        for emp in data
        if emp.get("sensor_id") is not None
    }

    deleted_ids = old_ids - new_ids

    for sensor_id in deleted_ids:
        if sensor_id.isdigit() and finger_instance is not None:
            sid = int(sensor_id)
            if finger_instance.delete_model(sid) == adafruit_fingerprint.OK:
                print(f"🗑️ [SYNC] Đã xóa vân tay ID #{sid} khỏi sensor (do server đã xóa)")

    with open(FILE_EMPLOYEES, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"=> 📖 Đã cập nhật {len(data)} nhân viên vào file nội bộ.")


@sio.on("force_sync_local_db")
def on_force_sync():
    print("🔄 [Đồng bộ] Máy chủ có cập nhật mới, đang tải lại danh bạ...")
    sio.emit("request_sync_data")


@sio.on("command_start_register")
def on_start_register(data):
    print(f"\n=> [Socket] Nhận lệnh quét vân tay từ Web (NV: {data.get('employee_id')})")
    task_queue.put({"type": "ENROLL", "data": data})


@sio.on("command_delete_fingerprint")
def on_delete_fingerprint(data):
    sensor_id = data.get("sensorId")
    if sensor_id is None or finger_instance is None:
        return

    if finger_instance.delete_model(int(sensor_id)) == adafruit_fingerprint.OK:
        print(f"✅ Đã xóa vân tay ID #{sensor_id} khỏi cảm biến AS608")


def connect_socket(finger):
    global finger_instance
    finger_instance = finger
    sio.connect(SERVER_URL, auth={"token": PI_SECRET_KEY})