import time
import RPi.GPIO as GPIO

from datetime import datetime
from hardware.indicators import init_gpio, turn_off_all
from hardware.fingerprint import init_fingerprint
from core.registration_finger_employees import do_enrollment
from core.attendance import check_attendance
from network.socket_client import sio, task_queue, connect_socket
from hardware.lcd import initialize_lcd, display_message, clean_lcd, display_wait_for_scan
from hardware.indicators import success_signal, fail_signal, late30_signal, late_over30_signal
from core.office_tracker import start_office_monitor


def main():
    init_gpio()
    turn_off_all()

    finger = init_fingerprint()
    initialize_lcd()
    start_office_monitor()
    

    try:
        connect_socket(finger)
    except Exception as e:
        print(f"⚠️ Khởi động Offline Mode (Không tìm thấy Server): {e}")

    print("\n🚀 RASPBERRY PI ĐANG CHẠY CHẾ ĐỘ TỰ ĐỘNG...")

    try:
        while True:
            try:
                if not task_queue.empty():
                    task = task_queue.get()
                    if task.get("type") == "ENROLL":
                        do_enrollment(finger, sio, task.get("data", {}))
                else:
                    display_wait_for_scan()
                    check_attendance(finger, sio)
                    time.sleep(0.1)
            except Exception as e:
                print(f"Lỗi vòng lặp: {e}")
                display_message("SYSTEM ERROR", "Try Again!")
                fail_signal()
                time.sleep(1)
    finally:
        turn_off_all()
        GPIO.cleanup()
        clean_lcd()
        if sio.connected:
            sio.disconnect()


if __name__ == "__main__":
    main()
