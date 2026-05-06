import RPi.GPIO as GPIO
from config import PIR_PIN, PIR_LED_PIN

def init_pir():
    """Khởi tạo chân GPIO cho cảm biến PIR và đèn LED báo hiệu."""
    GPIO.setup(PIR_PIN, GPIO.IN)
    GPIO.setup(PIR_LED_PIN, GPIO.OUT, initial=GPIO.LOW)

def is_motion_detected():
    return GPIO.input(PIR_PIN) == GPIO.HIGH

def turn_on_pir_led():
    GPIO.output(PIR_LED_PIN, GPIO.HIGH)

def turn_off_pir_led():
    GPIO.output(PIR_LED_PIN, GPIO.LOW)