import time
import RPi.GPIO as GPIO

from config import PIN_R, PIN_G, PIN_B, PIN_BUZ, RELAY_PIN
from hardware.lcd import display_message


def init_gpio():
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    GPIO.setup([PIN_R, PIN_G, PIN_B, PIN_BUZ, RELAY_PIN], GPIO.OUT, initial=GPIO.HIGH)


def turn_off_all():
    GPIO.output(PIN_R, GPIO.HIGH)
    GPIO.output(PIN_G, GPIO.HIGH)
    GPIO.output(PIN_B, GPIO.HIGH)
    GPIO.output(PIN_BUZ, GPIO.LOW)
    GPIO.output(RELAY_PIN, GPIO.LOW)


def success_signal():
    turn_off_all()
    GPIO.output(PIN_G, GPIO.LOW)
    GPIO.output(PIN_BUZ, GPIO.HIGH)
    time.sleep(0.15)
    GPIO.output(PIN_BUZ, GPIO.LOW)
    time.sleep(1)
    turn_off_all()


def fail_signal():
    turn_off_all()
    GPIO.output(PIN_R, GPIO.LOW)
    for _ in range(2):
        GPIO.output(PIN_BUZ, GPIO.HIGH)
        time.sleep(0.3)
        GPIO.output(PIN_BUZ, GPIO.LOW)
        time.sleep(0.1)
    turn_off_all()

def late30_signal():
    turn_off_all()
    GPIO.output(PIN_R, GPIO.LOW) 
    GPIO.output(PIN_G, GPIO.LOW) 
    GPIO.output(PIN_BUZ, GPIO.HIGH)
    time.sleep(0.15)
    GPIO.output(PIN_BUZ, GPIO.LOW)
    time.sleep(1)
    turn_off_all()
    
def late_over30_signal():
    turn_off_all()
    GPIO.output(PIN_R, GPIO.LOW) 
    GPIO.output(PIN_B, GPIO.LOW) 
    GPIO.output(PIN_BUZ, GPIO.HIGH)
    time.sleep(0.15)
    GPIO.output(PIN_BUZ, GPIO.LOW)
    time.sleep(1)
    turn_off_all()
    
    
def open_door_signal(emp_code):
    GPIO.output(RELAY_PIN, GPIO.HIGH) # Bật Relay (mở cửa)
    GPIO.output(PIN_G, GPIO.LOW) # Bật đèn xanh
    display_message(f"WELCOME-{emp_code}", "Door Opened!")
    time.sleep(5) # Giữ cửa mở trong 5 giây
    GPIO.output(RELAY_PIN, GPIO.LOW) # Tắt Relay (đóng cửa)
    turn_off_all()
    
def beep_once():
    GPIO.output(PIN_BUZ, GPIO.HIGH)
    time.sleep(0.15)
    GPIO.output(PIN_BUZ, GPIO.LOW)
    
def beep_twice():
    for _ in range(2):
        GPIO.output(PIN_BUZ, GPIO.HIGH)
        time.sleep(0.15)
        GPIO.output(PIN_BUZ, GPIO.LOW)
        time.sleep(0.1)