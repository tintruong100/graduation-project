import time
import threading
from storage.local_db import get_people_in_office_count
from hardware.pir import init_pir, is_motion_detected, turn_on_pir_led, turn_off_pir_led
from hardware.indicators import warning_signal
from hardware.lcd import display_message
from config import ARLERT_DURATION
from network.socket_client import emit_intruder_alert

last_empty_time = None

def monitor_pir_sensor():
    """Luồng chạy ngầm đếm thời gian và kiểm tra cảm biến PIR liên tục."""
    global last_empty_time
    
    # Khởi tạo chân GPIO cho cảm biến PIR
    init_pir()
    
    is_checking_continuously = False

    while True:
        time.sleep(2.5)  # Kiểm tra mỗi 3 giây để đảm bảo tính liên tục và nhạy bén
        
        # Đếm số người hiện tại trong file JSON
        people_count = get_people_in_office_count()

        if people_count == 0:
            # Văn phòng không có ai
            if last_empty_time is None:
                last_empty_time = time.time()
                
            elif time.time() - last_empty_time >= ARLERT_DURATION:  # Đủ thời gian cảnh báo
                # Bắt đầu chuyển sang chế độ quét liên tục
                if not is_checking_continuously:
                    print("[Tracker] Văn phòng trống " + str(ARLERT_DURATION) + " giây. BẬT chế độ quét cảm biến liên tục...")
                    turn_on_pir_led()
                    is_checking_continuously = True
                    time.sleep(2)  # Đợi 2 giây cho cảm biến bắt chuyển động ổn định lần đầu
                
                # Lúc này đang ở chế độ liên tục -> Kiểm tra cảm biến
                if is_motion_detected():
                    print("[CẢNH BÁO] Phát hiện có người nhưng file trống!")
                    emit_intruder_alert()
                    display_message("WARNING!", "Motion Detected!")
                    for i in range(5):  # Hú liên tục trong 5 lần
                        warning_signal()  # Gọi tín hiệu báo lỗi
                    # Không reset last_empty_time để nó tiếp tục hú nếu người đó không chịu quẹt vân tay

        else:
            # Có người trong văn phòng, reset lại bộ đếm về Null
            last_empty_time = None
            
            # Nếu đang ở chế độ quét liên tục thì TẮT đi
            if is_checking_continuously:
                print("[Tracker] Đã có người vào văn phòng. TẮT chế độ quét cảm biến.")
                turn_off_pir_led()
                is_checking_continuously = False

def start_office_monitor():
    """Kích hoạt luồng theo dõi độc lập."""
    monitor_thread = threading.Thread(target=monitor_pir_sensor, daemon=True)
    monitor_thread.start()