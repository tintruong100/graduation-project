import time
import os
import socketio
import queue
import json
import base64
import datetime
import threading
import cv2  # Thư viện xử lý Webcam

# ==========================================
# CẤU HÌNH SERVER
# ==========================================
SERVER_URL = "http://localhost:8001"
FILE_EMPLOYEES = 'local_employees.json'
FILE_OFFLINE_LOGS = 'offline_attendance.json'

sio = socketio.Client()
task_queue = queue.Queue()

# ==========================================
# CÁC HÀM XỬ LÝ OFFLINE (JSON DB)
# ==========================================
def load_local_employees():
    if os.path.exists(FILE_EMPLOYEES):
        with open(FILE_EMPLOYEES, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def get_employee_by_sensor_id(sensor_id):
    employees = load_local_employees()
    for emp in employees:
        if str(emp.get('sensor_id')) == str(sensor_id):
            return emp
    return None

def save_offline_log(log_data):
    logs = []
    if os.path.exists(FILE_OFFLINE_LOGS):
        with open(FILE_OFFLINE_LOGS, 'r', encoding='utf-8') as f:
            logs = json.load(f)
    logs.append(log_data)
    with open(FILE_OFFLINE_LOGS, 'w', encoding='utf-8') as f:
        json.dump(logs, f, ensure_ascii=False, indent=4)
    print(f"💾 [Offline] Đã lưu tạm chấm công của {log_data.get('employee_id')} vào máy.")

def sync_offline_logs():
    if not os.path.exists(FILE_OFFLINE_LOGS):
        return
    with open(FILE_OFFLINE_LOGS, 'r', encoding='utf-8') as f:
        logs = json.load(f)
    if len(logs) > 0:
        print(f"🔄 [Sync] Đang đẩy {len(logs)} bản ghi offline lên Server...")
        for log in logs:
            img_path = log.get('image_path')
            if img_path and os.path.exists(img_path):
                with open(img_path, 'rb') as img_file:
                    log['image_data'] = base64.b64encode(img_file.read()).decode('utf-8')
                os.remove(img_path)
        sio.emit('sync_offline_attendance', logs)
        with open(FILE_OFFLINE_LOGS, 'w', encoding='utf-8') as f:
            json.dump([], f)

# ==========================================
# CÁC HÀM TIỆN ÍCH GIẢ LẬP (MOCK)
# ==========================================
def success_signal():
    print("🔊 [PHẦN CỨNG] Đèn Xanh Sáng - Bíp! (Thành công)")

def fail_signal():
    print("🔊 [PHẦN CỨNG] Đèn Đỏ Sáng - Bíp! Bíp! (Thất bại)")

def capture_image():
    """Sử dụng Webcam của máy tính để chụp ảnh thật"""
    print("[Camera] Đang mở Webcam để chụp ảnh...")
    if not os.path.exists('captures'): 
        os.makedirs('captures')
    
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    final_filename = f"captures/img_{timestamp}.jpg"
    
    try:
        # Khởi tạo kết nối với Webcam (ID 0 thường là camera mặc định)
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            raise Exception("Không thể mở Webcam máy tính!")

        # Đọc bỏ qua vài khung hình đầu tiên để Camera kịp tự động lấy sáng
        for _ in range(5):
            cap.read()
            time.sleep(0.1)

        # Đọc khung hình chính thức
        ret, frame = cap.read()
        
        if not ret:
            raise Exception("Không thể đọc dữ liệu hình ảnh từ Webcam!")

        # Ép kích thước về 640x480 và lưu nén 70%
        frame_resized = cv2.resize(frame, (640, 480))
        cv2.imwrite(final_filename, frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 70])
        
        cap.release()
        
        print(f"[Camera] 📸 Đã chụp ảnh thành công từ Webcam: {final_filename}")
        return final_filename
        
    except Exception as e:
        print(f"❌ Lỗi Camera: {e}")
        print("[Camera] Chuyển sang tạo file ảnh giả lập...")
        with open(final_filename, 'wb') as f:
            f.write(b"MOCK_IMAGE_DATA_FOR_BACKEND_TESTING")
        return final_filename

# ==========================================
# CÁC SỰ KIỆN SOCKET.IO
# ==========================================
@sio.event
def connect():
    print("\n✅ Đã kết nối Socket.IO tới Server!")
    sio.emit('request_sync_data')
    sync_offline_logs()

@sio.event
def disconnect():
    print("\n⚠️ Mất kết nối Socket.IO! (Chuyển sang chế độ Offline)")

@sio.on('sync_data_response')
def on_sync_data(data):
    with open(FILE_EMPLOYEES, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"=> 📖 Đã cập nhật {len(data)} nhân viên vào DB cục bộ.")

@sio.on('command_start_register')
def on_start_register(data):
    print(f"\n=> [Socket] Nhận lệnh quét vân tay từ Web (NV: {data.get('employee_id')})")
    task_queue.put({'type': 'ENROLL', 'data': data})

@sio.on('command_delete_fingerprint')
def on_delete_fingerprint(data):
    sensor_id = data.get('sensorId') 
    if sensor_id:
        print(f"✅ [MOCK] Giả lập xóa vân tay ID #{sensor_id} khỏi cảm biến thành công.")

# ==========================================
# LOGIC XỬ LÝ CHÍNH (GIẢ LẬP)
# ==========================================
def do_enrollment(data):
    employee_id = data.get('employee_id')
    finger_name = data.get('finger_name')

    print(f"\n--- ĐANG ĐĂNG KÝ: {finger_name} (NV: {employee_id}) ---")
    
    try:
        location = input(">> [MOCK] Nhập ID Slot (1-127) muốn lưu cho vân tay này: ").strip()
        location = int(location)
        
        time.sleep(1)
        print(">> Bíp! Lấy ảnh 1 xong.")
        time.sleep(1)
        print(">> Bíp! Lấy ảnh 2 xong.")
        
        template_hex = "A1B2C3D4E5F6MOCKHEXDATA9988776655" 
        
        print(f"✅ ĐĂNG KÝ THÀNH CÔNG (SLOT #{location})!")
        success_signal()

        sio.emit('pi_enrollment_result', {
            "success": True,
            "data": {
                "employee_id": employee_id,
                "finger_name": finger_name,
                "sensor_id": location,
                "template_data": template_hex,
            }
        })
    except Exception as e:
        print(f"❌ THẤT BẠI DO LỖI NHẬP LIỆU: {e}")
        fail_signal()
        sio.emit('pi_enrollment_result', {
            "success": False, 
            "data": {"employee_id": employee_id}, 
            "error": "Lỗi thao tác giả lập"
        })

def process_mock_attendance(sensor_id):
    print(f"\n[Chấm công] Đang tìm kiếm vân tay ID #{sensor_id}...")
    
    emp_info = get_employee_by_sensor_id(sensor_id)
    
    if not emp_info:
        print(f"⚠️ CẢNH BÁO: Vân tay #{sensor_id} KHÔNG CÓ trong DB nội bộ!")
        fail_signal()
        emp_id = f"Unknown_ID_{sensor_id}"
    else:
        emp_id = emp_info.get('employee_id')
        emp_name = emp_info.get('full_name', 'N/A')
        emp_code = emp_info.get('employee_code', 'N/A')
        print(f"✅ TRÙNG KHỚP: {emp_name} | Mã NV: {emp_code} (System ID: {emp_id})")
        success_signal()

    image_filepath = capture_image()
    
    log_data = {
        'sensor_id': sensor_id,
        'employee_id': emp_id,
        'scan_time': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    if sio.connected:
        if image_filepath and os.path.exists(image_filepath):
            with open(image_filepath, 'rb') as f:
                log_data['image_data'] = base64.b64encode(f.read()).decode('utf-8')
            os.remove(image_filepath) 
        else:
            log_data['image_data'] = None

        sio.emit('attendance_scan', log_data)
        print("📤 Đã báo cáo dữ liệu quét lên Server!")
    else:
        log_data['image_path'] = image_filepath 
        save_offline_log(log_data)
        print("💾 Mất mạng: Đã lưu lịch sử và GIỮ LẠI FILE ẢNH chờ đồng bộ.")

# ==========================================
# THREAD ĐỂ NHẬP LỆNH TỪ BÀN PHÍM
# ==========================================
def terminal_input_thread():
    time.sleep(2)
    print("\n" + "="*50)
    print(" CÔNG CỤ TEST BACKEND BẰNG BÀN PHÍM & WEBCAM")
    print(" - Gõ 's' rồi Enter: Giả lập có người quét vân tay (Sẽ bật Webcam)")
    print(" - Gõ 'q' rồi Enter: Thoát chương trình")
    print("="*50 + "\n")
    
    while True:
        cmd = input("").strip().lower()
        if cmd == 'q':
            print("Đang thoát...")
            os._exit(0)
        elif cmd == 's':
            sid = input(">> Nhập ID Cảm Biến muốn giả lập quét (VD: 1, 2, 10): ").strip()
            if sid.isdigit():
                task_queue.put({'type': 'ATTENDANCE', 'sensor_id': int(sid)})
            else:
                print("❌ ID không hợp lệ, phải là số nguyên!")

# ==========================================
# MAIN LOOP
# ==========================================
def main():
    try:
        sio.connect(SERVER_URL)
    except Exception as e:
        print(f"⚠️ Khởi động Offline Mode (Không tìm thấy Server): {e}")

    input_thread = threading.Thread(target=terminal_input_thread, daemon=True)
    input_thread.start()
    
    while True:
        try:
            if not task_queue.empty():
                task = task_queue.get()
                if task['type'] == 'ENROLL':
                    do_enrollment(task['data'])
                elif task['type'] == 'ATTENDANCE':
                    process_mock_attendance(task['sensor_id'])
            time.sleep(0.1) 
        except Exception as e:
            print(f"Lỗi vòng lặp: {e}")
            time.sleep(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nĐang dọn dẹp và thoát...")
        sio.disconnect()