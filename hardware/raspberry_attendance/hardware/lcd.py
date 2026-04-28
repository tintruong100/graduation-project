from RPLCD.i2c import CharLCD
from datetime import datetime

def initialize_lcd():
    global lcd
    lcd = CharLCD(i2c_expander='PCF8574', address=0x27, port=1, cols=16, rows=2, dotsize=8)
    lcd.clear()

def clean_lcd():
    lcd.clear()

def display_message(line1, line2):
    lcd.clear()
    lcd.write_string(line1)
    lcd.cursor_pos = (1, 0)
    lcd.write_string(line2)

def display_wait_for_scan():
    time_now = datetime.now().strftime('%y-%m-%d %H:%M')
    lcd.cursor_pos = (0, 0)
    lcd.write_string(time_now)
    lcd.cursor_pos = (1, 0)
    lcd.write_string("WAITING FOR SCAN")