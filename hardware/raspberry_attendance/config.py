from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CAPTURES_DIR = DATA_DIR / "captures"
CHECKIN_FILE = DATA_DIR / "checkin_employees.json"

PIN_R = 17
PIN_G = 27
PIN_B = 22
PIN_BUZ = 23
PIN_TCH = 18
RELAY_PIN = 24

SERVER_URL = "https://graduation-project-siuu.onrender.com"

FILE_EMPLOYEES = DATA_DIR / "local_employees.json"
FILE_OFFLINE_LOGS = DATA_DIR / "offline_attendance.json"

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CAPTURES_DIR = BASE_DIR / "data" / "captures"
MAX_CAPTURE_IMAGES = 10
  