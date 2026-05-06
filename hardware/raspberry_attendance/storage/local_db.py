import base64
import json
import os

from config import FILE_EMPLOYEES, FILE_OFFLINE_LOGS, CHECKIN_FILE, IN_OFFICE_FILE
from datetime import date


def _ensure_parent(path):
    path.parent.mkdir(parents=True, exist_ok=True)


def load_local_employees():
    if FILE_EMPLOYEES.exists():
        with open(FILE_EMPLOYEES, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def get_employee_by_sensor_id(sensor_id):
    employees = load_local_employees()
    for emp in employees:
        if str(emp.get("sensor_id")) == str(sensor_id):
            return emp
    return None


def save_offline_log(log_data):
    logs = []
    if FILE_OFFLINE_LOGS.exists():
        with open(FILE_OFFLINE_LOGS, "r", encoding="utf-8") as f:
            logs = json.load(f)

    logs.append(log_data)
    _ensure_parent(FILE_OFFLINE_LOGS)
    with open(FILE_OFFLINE_LOGS, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=4)

    print(f"💾 [Offline] Đã lưu tạm chấm công của {log_data.get('employee_id')} vào máy.")


def sync_offline_logs(sio):
    if not FILE_OFFLINE_LOGS.exists():
        return

    with open(FILE_OFFLINE_LOGS, "r", encoding="utf-8") as f:
        logs = json.load(f)

    if len(logs) > 0:
        print(f"🔄 [Sync] Đang đẩy {len(logs)} bản ghi chấm công offline lên Server...")
        for log in logs:
            img_path = log.get("image_path")
            if img_path and os.path.exists(img_path):
                with open(img_path, "rb") as img_file:
                    log["image_data"] = base64.b64encode(img_file.read()).decode("utf-8")
                os.remove(img_path)

        sio.emit("sync_offline_attendance", logs)

        with open(FILE_OFFLINE_LOGS, "w", encoding="utf-8") as f:
            json.dump([], f)
            

def _today():
    return date.today().isoformat()


def _empty_checkin_db():
    return {
        "date": _today(),
        "records": []
    }


def load_checkin_db():
    if not CHECKIN_FILE.exists():
        return _empty_checkin_db()

    try:
        with open(CHECKIN_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return _empty_checkin_db()

    if data.get("date") != _today():
        save_checkin_db(_empty_checkin_db())
        return _empty_checkin_db()

    if "records" not in data or not isinstance(data["records"], list):
        return _empty_checkin_db()

    return data


def save_checkin_db(data):
    _ensure_parent(CHECKIN_FILE)

    with open(CHECKIN_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


def register_checkin(emp_info):
    db = load_checkin_db()
    records = db["records"]

    for item in records:
        if str(item.get("employee_code")) == str(emp_info.get("employee_code")):
            save_checkin_db(db)
            return False, item

    new_item = {
        "employee_code": emp_info.get("employee_code")
    }

    records.append(new_item)
    save_checkin_db(db)
    return True, new_item

def toggle_person_in_office(employee_code):
    """
    Quét lần đầu thêm vào file json, quét lần tiếp theo xóa khỏi file json.
    """
    _ensure_parent(IN_OFFICE_FILE)
    
    people = []
    # Đọc dữ liệu nếu file đã tồn tại
    if IN_OFFICE_FILE.exists():
        try:
            with open(IN_OFFICE_FILE, "r", encoding="utf-8") as f:
                people = json.load(f)
        except Exception:
            # Xử lý trường hợp file rỗng hoặc lỗi format
            people = []

    # Kiểm tra và thêm/xóa nhân viên
    if employee_code in people:
        people.remove(employee_code)
        print(f"[Local DB] {employee_code} đã RỜI KHỎI văn phòng.")
    else:
        people.append(employee_code)
        print(f"[Local DB] {employee_code} đã VÀO văn phòng.")

    # Ghi đè lại mảng vào file JSON
    with open(IN_OFFICE_FILE, "w", encoding="utf-8") as f:
        json.dump(people, f, ensure_ascii=False, indent=4)

def get_people_in_office_count():
    """
    Trả về số lượng người hiện đang có trong văn phòng từ file json.
    """
    if not IN_OFFICE_FILE.exists():
        return 0
    try:
        with open(IN_OFFICE_FILE, "r", encoding="utf-8") as f:
            people = json.load(f)
        return len(people)
    except Exception:
        return 0