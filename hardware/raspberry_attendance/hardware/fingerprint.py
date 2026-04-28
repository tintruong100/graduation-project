import time
import serial
import adafruit_fingerprint
import RPi.GPIO as GPIO

from config import PIN_B, PIN_BUZ

finger = None

def init_fingerprint():
    global finger
    if finger is None:
        uart = serial.Serial("/dev/serial0", baudrate=57600, timeout=1)
        finger = adafruit_fingerprint.Adafruit_Fingerprint(uart)
    return finger

def get_fingerprint():
    return init_fingerprint()


def wait_for_finger(finger, timeout=15):
    start_time = time.time()
    while time.time() - start_time < timeout:
        if finger.get_image() == adafruit_fingerprint.OK:
            return True
    return False