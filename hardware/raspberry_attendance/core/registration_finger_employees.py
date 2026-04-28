import time
import RPi.GPIO as GPIO
import adafruit_fingerprint

from config import PIN_B, PIN_BUZ
from hardware.indicators import success_signal,  fail_signal, beep_once, beep_twice
from hardware.lcd import initialize_lcd, display_message, clean_lcd, display_wait_for_scan


def wait_for_finger(finger, timeout=15):
    start_time = time.time()
    while time.time() - start_time < timeout:
        if finger.get_image() == adafruit_fingerprint.OK:
            return True
    return False


def do_enrollment(finger, sio, data):
    employee_id = data.get("employee_id")
    finger_name = data.get("finger_name")
    employee_code = data.get("employee_code")

    print(f"\n--- ĐANG ĐĂNG KÝ: {finger_name} (NV: {employee_code}) ---")
    print(data)

    location = 5
    while location <= 127:
        if finger.read_templates() == adafruit_fingerprint.OK:
            if location not in finger.templates:
                break
        location += 1
        
    if location > 127:
        sio.emit(
            "pi_enrollment_result",
            {
                "success": False,
                "data": {"employee_id": employee_id},
                "error": "Bộ nhớ cảm biến đã đầy",
            },
        )
        return

    try:
        GPIO.output(PIN_B, GPIO.LOW)
        beep_once()
        display_message("ENROLLMENT", f"ID: {employee_code}")
        time.sleep(3)
        print(">> ĐÈN SÁNG: Mời đặt tay vào cảm biến...")
        display_message("ENROLLMENT", "Place finger...")
        beep_twice()
        
        if not wait_for_finger(finger, timeout=20):
            raise Exception("Time Out!")

        finger.image_2_tz(1)
        print(">> Bíp! Lấy ảnh 1 xong. Nhấc tay ra...")
        display_message("ENROLLMENT", "Remove finger...")
        beep_once()

        while finger.get_image() != adafruit_fingerprint.NOFINGER:
            pass

        print(">> Mời đặt LẠI ngón tay đó...")
        display_message("ENROLLMENT", "Place finger...")
        if not wait_for_finger(finger, timeout=15):
            raise Exception("Time Out!")

        finger.image_2_tz(2)
        print(">> Bíp! Lấy ảnh 2 xong.")
        display_message("ENROLLMENT", "Processing...")
        beep_once()

        if finger.create_model() != adafruit_fingerprint.OK:
            raise Exception("Do not match!")
            
        if finger.store_model(location) != adafruit_fingerprint.OK:
            raise Exception("Failed to store!")  

        template_bytes = finger.get_fpdata("char", 1)
        template_hex = "".join([f"{x:02X}" for x in template_bytes])

        print(f"✅ ĐĂNG KÝ THÀNH CÔNG (SLOT #{location})!")
        display_message("ENROLLMENT", "Completely!")
        success_signal()

        sio.emit(
            "pi_enrollment_result",
            {
                "success": True,
                "data": {
                    "employee_id": employee_id,
                    "finger_name": finger_name,
                    "sensor_id": location,
                    "template_data": template_hex,
                },
            },
        )

    except Exception as e:
        print(f"❌ THẤT BẠI: {e}")
        display_message("ENROLLMENT", f"{e}")
        fail_signal()
        sio.emit(
            "pi_enrollment_result",
            {
                "success": False,
                "data": {"employee_id": employee_id},
                "error": str(e),
            },
        )