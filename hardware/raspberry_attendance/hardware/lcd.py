from RPLCD.i2c import CharLCD
from datetime import datetime
import time

lcd = None
_last_time_str = ""
_is_waiting_screen = False

def initialize_lcd():
    global lcd
    lcd = CharLCD(i2c_expander='PCF8574', address=0x27, port=1, cols=16, rows=2, dotsize=8)
    lcd.clear()

def clean_lcd():
    if lcd is not None:
        lcd.clear()

def display_message(line1, line2):
    global _is_waiting_screen, _last_time_str
    _is_waiting_screen = False
    _last_time_str = ""
    lcd.clear()
    lcd.cursor_pos = (0, 0)
    lcd.write_string(line1)
    lcd.cursor_pos = (1, 0)
    lcd.write_string(line2)

def display_wait_for_scan():
    """
    Hiển thị màn hình chờ. Chỉ cập nhật khi thời gian nhảy sang phút mới 
    hoặc khi màn hình vừa bị thông báo khác chiếm dụng.
    """
    global _last_time_str, _is_waiting_screen
    
    time_now = datetime.now().strftime('%y-%m-%d %H:%M')
    
    # Chỉ ra lệnh ghi lên màn hình nếu thời gian đã đổi HOẶC màn hình vừa hiển thị message khác
    if time_now != _last_time_str or not _is_waiting_screen:
        time.sleep(1)
        lcd.clear() 
        lcd.cursor_pos = (0, 0)
        lcd.write_string(time_now)
        
        lcd.cursor_pos = (1, 0)
        lcd.write_string("WAITING FOR SCAN")
        
        # Cập nhật lại trạng thái
        _last_time_str = time_now
        _is_waiting_screen = True