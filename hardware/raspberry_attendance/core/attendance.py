import base64
import os
import time
import adafruit_fingerprint

LAST_SCAN = {}
SCAN_COOLDOWN = 30  # giây

from hardware.camera import capture_image
from hardware.indicators import late_over30_signal, success_signal, fail_signal, late30_signal, open_door_signal
from storage.local_db import get_employee_by_sensor_id, save_offline_log, toggle_person_in_office
# from network.socket_client import enqueue_attendance
from storage.local_db import register_checkin
from datetime import datetime
from hardware.lcd import initialize_lcd, display_message, clean_lcd, display_wait_for_scan



def print_attendance_status(emp_info, scan_time_str, emp_start_time):
    if not emp_start_time:
        return

    scan_time = datetime.strptime(scan_time_str, "%Y-%m-%d %H:%M:%S")
    start_dt = datetime.strptime(
        f"{scan_time.strftime('%Y-%m-%d')} {emp_start_time}",
        "%Y-%m-%d %H:%M:%S"
    )

    diff_minutes = int((scan_time - start_dt).total_seconds() / 60)

    if diff_minutes <= 0:
        print(f"Đúng giờ")
        display_message(f"CHECK_IN-{emp_info.get('employee_code')}", "On Time!")
        #print_LCD
        success_signal()
    elif diff_minutes < 30:
        print(f"Đang trễ dưới 30 phút")
        display_message(f"CHECK_IN-{emp_info.get('employee_code')}", "Late!")
        late30_signal()

    else:
        print(f"Đang trễ trên 30 phút")
        display_message(f"CHECK_IN-{emp_info.get('employee_code')}", "Late Over 30!")
        late_over30_signal()
        
          
def bao_trang_thai(emp_info, emp_start_time, scan_time_str):

    is_first_checkin, _ = register_checkin(emp_info)
    if is_first_checkin:
       print_attendance_status(emp_info, scan_time_str, emp_start_time)
    else:
        print("Vân tay hợp lệ")
        display_message(f"WELCOME-{emp_info.get('employee_code')}", "SUCCESS")
        success_signal()

def is_duplicate_scan(employee_id):
    now = time.time()
    last_time = LAST_SCAN.get(employee_id)

    if last_time and (now - last_time) < SCAN_COOLDOWN:
        return True

    LAST_SCAN[employee_id] = now
    return False


def check_attendance(finger, sio):
    """Hàm chấm công chính"""
    if finger.get_image() == adafruit_fingerprint.OK:
        if finger.image_2_tz(1) != adafruit_fingerprint.OK:
            return

        print("\n[Chấm công] Loading...")
        display_message("Loading...", "")
        if finger.finger_search() == adafruit_fingerprint.OK:
            sensor_id = finger.finger_id

            emp_info = get_employee_by_sensor_id(sensor_id)
            emp_start_time = emp_info.get("start_time")
            emp_id = emp_info.get("employee_id") 
            emp_code = emp_info.get("employee_code")
            emp_name = emp_info.get("full_name")
            scan_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            if is_duplicate_scan(emp_id):
                print("⚠️ Bỏ qua: Quét trùng trong thời gian ngắn")
                display_message("SPAM WARNING!", "Try again later")
                fail_signal()
                return

            image_filepath = capture_image(sensor_id)
            
            bao_trang_thai(emp_info, emp_start_time, scan_time)
            open_door_signal(emp_code)
            toggle_person_in_office(emp_code)

            log_data = {
                "sensor_id": sensor_id,
                "employee_id": emp_id,
                "employee_code": emp_code,
                "scan_time": scan_time,
            }
                
                      
            if sio.connected:
                if image_filepath and os.path.exists(image_filepath):
                    with open(image_filepath, "rb") as f:
                        log_data["image_data"] = base64.b64encode(f.read()).decode("utf-8")
                    os.remove(image_filepath)
                else:
                    log_data["image_data"] = None
                sio.emit('attendance_scan', log_data)
                print("✅ Đã gửi dữ liệu chấm công lên Server.")
                # enqueue_attendance(log_data)
                # print("⏳ Đã đưa dữ liệu vào hàng đợi gửi server.")
            else:
                log_data["image_path"] = image_filepath
                save_offline_log(log_data)
                print("💾 Mất mạng: Đã lưu lịch sử và GIỮ LẠI FILE ẢNH chờ đồng bộ.")
        else:
            print("❌ KHÔNG TRÙNG KHỚP!")
            display_message("NOT RECOGNIZED", "Try again")
            fail_signal()