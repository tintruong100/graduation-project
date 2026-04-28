import datetime
import os
import subprocess
from pathlib import Path

from config import CAPTURES_DIR, MAX_CAPTURE_IMAGES

from storage.local_db import get_employee_by_sensor_id

def prune_captures(keep=MAX_CAPTURE_IMAGES):
    files = sorted(
        CAPTURES_DIR.glob("*.jpg"),
        key=lambda p: p.stat().st_mtime,
        reverse=True
    )
    for old_file in files[keep:]:
        try:
            old_file.unlink()
        except:
            pass


def capture_image(sensor_id=None):
    print("[Camera] Đang chụp ảnh...")
    CAPTURES_DIR.mkdir(parents=True, exist_ok=True)

    emp_info = get_employee_by_sensor_id(sensor_id) if sensor_id else None
    username = emp_info.get("employee_code") if emp_info else "unknown"

    now = datetime.datetime.now()
    date_str = now.strftime("%Y%m%d")
    time_str = now.strftime("%H%M%S")

    # đếm số lần quét trong ngày
    existing_files = list(CAPTURES_DIR.glob(f"{username}_{date_str}_*.jpg"))
    scan_count = len(existing_files) + 1

    final_filename = CAPTURES_DIR / f"{username}_{date_str}_{time_str}_{scan_count}.jpg"

    try:
        subprocess.run(
            [
                "rpicam-jpeg",
                "-o", str(final_filename),
                "-t", "500",
                "--width", "640",
                "--height", "480",
                "-q", "70",
                "--nopreview",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=10
        )

        prune_captures()
        print(f"[Camera] 📸 Đã chụp và nén ảnh thành công: {final_filename}")
        return str(final_filename)

    except Exception as e:
        print(f"❌ Lỗi phần cứng camera khi chụp ảnh: {e}")
        return None