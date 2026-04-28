import db from '../models/index.js';
import dateUtils from '../utils/dateUtils.js';
import employeeService from './employeeService.js';
import { Op } from 'sequelize';

// ==========================================
// 1. HÀM TRUY VẤN: Lấy bản ghi điểm danh
// ==========================================
const getEmployeeAttendanceByDate = async (employee_id, work_date) => {
    if (!employee_id || !work_date) throw { status: 400, message: 'Thiếu employee_id hoặc work_date' };
    return await db.AttendanceSummary.findOne({
        where: { employee_id, work_date }
    });
};

const getAllAttendanceSummaryByDate = async (work_date) => {
    if (!work_date) throw { status: 400, message: 'Thiếu work_date' };

    const result = await db.AttendanceSummary.findAll({
        where: { work_date },
        include: [
            {
                model: db.Employee,
                as: 'employee',
                attributes: ['id', 'full_name', 'employee_code'], // Chỉ lấy các trường cần show
                include: [
                    {
                        model: db.Department,
                        as: 'department',
                        attributes: ['id', 'name']
                    }
                ]
            }
        ],
        raw: true,
        nest: true,
        // Sắp xếp danh sách trả về theo thứ tự Mã Nhân Viên cho đẹp đội hình
        order: [[{ model: db.Employee, as: 'employee' }, 'employee_code', 'ASC']]
    });

    return result;
};

const getEmployeeAttendanceSummaryByMonth = async (employee_id, month, year) => {
    if (!employee_id || !month || !year) throw { status: 400, message: 'Thiếu employee_id hoặc month hoặc year' };
    const startDate = dateUtils.getStartOfMonth(year, month);
    const endDate = dateUtils.getEndOfMonth(year, month);

    return await db.AttendanceSummary.findAll({
        where: {
            employee_id,
            work_date: {
                [Op.between]: [startDate, endDate]
            }
        },
        order: [['work_date', 'ASC']]
    });
}

// ==========================================
// 2. HÀM HỖ TRỢ: Tính toán giờ làm chuẩn
// ==========================================
const getTargetTimes = (employee, workDate) => {
    // LOGIC FALLBACK: Lấy giờ cá nhân, nếu NULL thì lấy giờ phòng ban
    const targetStartTimeStr = employee.custom_start_time || employee.department?.start_time || '08:00:00';
    const targetEndTimeStr = employee.custom_end_time || employee.department?.end_time || '17:00:00';

    return {
        targetStartDate: dateUtils.createDateFromTimeStr(workDate, targetStartTimeStr),
        targetEndDate: dateUtils.createDateFromTimeStr(workDate, targetEndTimeStr)
    };
};

// ==========================================
// 3. NGHIỆP VỤ A: XỬ LÝ CHECK-IN (Quét lần đầu)
// ==========================================
const handleCheckIn = async (employee_id, workDate, scan_time, scanDateObj, targetStartDate) => {
    let lateMinutes = 0;

    // Nếu giờ quét tay LỚN HƠN giờ quy định -> Đi trễ
    if (scanDateObj > targetStartDate) {
        lateMinutes = Math.floor((scanDateObj - targetStartDate) / 60000);
    }

    const summary = await db.AttendanceSummary.create({
        employee_id,
        work_date: workDate,
        first_scan_time: scan_time,
        last_scan_time: scan_time,
        late_minutes: lateMinutes,
        early_leave_minutes: 0,
        gross_work_hours: 0,
        net_work_hours: 0,
        total_scans: 1,
        status: lateMinutes > 0 ? 'LATE' : 'PRESENT'
    });

    return { success: true, action: 'CHECK_IN', summary };
};

// ==========================================
// 4. NGHIỆP VỤ B: XỬ LÝ CHECK-OUT (Cập nhật giờ về)
// ==========================================
const handleCheckOut = async (summary, scan_time, scanDateObj, targetEndDate) => {
    const firstScanObj = new Date(summary.first_scan_time);

    // 1. Tính tổng thời gian có mặt (Gross)
    const grossMs = scanDateObj - firstScanObj;
    const grossHours = parseFloat((grossMs / (1000 * 60 * 60)).toFixed(2));

    // 3. Tính số phút về sớm
    let earlyMinutes = 0;
    if (scanDateObj < targetEndDate) {
        earlyMinutes = Math.floor((targetEndDate - scanDateObj) / 60000);
    }

    // 4. CẬP NHẬT LẠI BẢN GHI (Sử dụng cách gọi thẳng từ db Model để không bao giờ bị lỗi)
    await db.AttendanceSummary.update({
        last_scan_time: scan_time,
        early_leave_minutes: earlyMinutes,
        gross_work_hours: grossHours,
        total_scans: (summary.total_scans || 1) + 1
    }, {
        where: { id: summary.id } // Tìm chính xác id của summary để update
    });

    // 5. Lấy lại bản ghi mới nhất vừa update để trả về
    const updatedSummary = await db.AttendanceSummary.findByPk(summary.id);

    return { success: true, action: 'CHECK_OUT', summary: updatedSummary };
};

// ==========================================
// 5. HÀM ĐIỀU PHỐI CHÍNH (ORCHESTRATOR)
// ==========================================
const processScanLog = async (employee_id, scan_time) => {
    // 1. Lấy thông tin nhân viên
    const employee = await employeeService.employee(employee_id);
    if (!employee) throw { status: 404, message: 'Không tìm thấy nhân viên trong hệ thống' };

    // 2. Chuyển đổi thời gian
    const scanDateObj = new Date(scan_time);
    const workDate = dateUtils.getVietnamDateString(scanDateObj);

    // 3. Tính toán mốc giờ chuẩn
    const { targetStartDate, targetEndDate } = getTargetTimes(employee, workDate);

    // 4. Tìm bản ghi cũ (Sử dụng lại hàm đã viết)
    const summary = await getEmployeeAttendanceByDate(employee_id, workDate);

    // 5. Rẽ nhánh logic cực kỳ rõ ràng
    if (!summary) {
        return await handleCheckIn(employee_id, workDate, scan_time, scanDateObj, targetStartDate);
    } else {
        return await handleCheckOut(summary, scan_time, scanDateObj, targetEndDate);
    }
};

// ==========================================
// KỊCH BẢN C1: XỬ LÝ NHÂN VIÊN VẮNG MẶT (CÚP LÀM)
// ==========================================
const handleAbsentEmployee = async (employee_id, targetDate) => {
    await db.AttendanceSummary.create({
        employee_id: employee_id,
        work_date: targetDate,
        status: 'ABSENT'
    });
    return 1; // Trả về 1 để cộng vào bộ đếm absentCount
};

// ==========================================
// KỊCH BẢN C2: XỬ LÝ QUÊN QUÉT VÂN TAY LÚC VỀ
// ==========================================
const handleMissingOutEmployee = async (summary) => {
    const firstTime = new Date(summary.first_scan_time).getTime();
    const lastTime = new Date(summary.last_scan_time).getTime();

    // Nếu thời gian quét vào = thời gian quét ra -> Chỉ quét 1 lần
    if (firstTime === lastTime && summary.status !== 'ABSENT') {
        await summary.update({ status: 'MISSING_OUT' });
        return 1; // Trả về 1 để cộng vào bộ đếm missingOutCount
    }
    return 0;
};

// ==========================================
// 6. NGHIỆP VỤ CHỐT SỔ (Dùng cho Cronjob chạy lúc 23:59 mỗi ngày)
// ==========================================
const finalizeDailyAttendance = async (targetDateStr) => {
    const targetDate = targetDateStr || dateUtils.getVietnamDateString(new Date());

    // 1. Kéo toàn bộ dữ liệu cần thiết lên một lần (Tối ưu truy vấn)
    const employees = await employeeService.getAll();
    const todaySummaries = await db.AttendanceSummary.findAll({ where: { work_date: targetDate } });

    let absentCount = 0;
    let missingOutCount = 0;

    // 2. Vòng lặp quét kiểm tra từng người
    for (const emp of employees) {
        const mySummary = todaySummaries.find(s => s.employee_id === emp.id);
        if (!mySummary) {
            // Rẽ nhánh: Không có log nào -> Đánh vắng mặt
            absentCount += await handleAbsentEmployee(emp.id, targetDate);
        } else {
            // Rẽ nhánh: Có log -> Kiểm tra xem có quên quét lúc về không
            missingOutCount += await handleMissingOutEmployee(mySummary);
            await setNetHoursForSummary(mySummary);
        }
    }

    // Nhớ phải có return để in log cho Cronjob biết mà báo cáo lại
    return { targetDate, absentCount, missingOutCount };
};

const setNetHoursForSummary = async (summary) => {
    const breakHours = parseFloat(summary.break_hours || 1.0);
    let netHours = summary.gross_work_hours - breakHours;
    if (netHours < 0) netHours = 0;
    await db.AttendanceSummary.update({ net_work_hours: netHours }, { where: { id: summary.id } });
};

const getMonthlySummaryAllEmployees = async (month, year) => {
    const startDate = dateUtils.getStartOfMonth(year, month);
    const endDate = dateUtils.getEndOfMonth(year, month);

    // Tính số ngày trong tháng đó (vd: tháng 4 có 30 ngày, tháng 2 có 28 ngày)
    const daysInMonth = new Date(year, month, 0).getDate();

    // Lấy toàn bộ log trong tháng
    const records = await db.AttendanceSummary.findAll({
        where: { work_date: { [Op.between]: [startDate, endDate] } },
        include: [
            {
                model: db.Employee, as: 'employee', attributes: ['id', 'full_name', 'employee_code', 'position'],
                include: [{ model: db.Department, as: 'department', attributes: ['name'] }]
            }
        ],
        raw: true, nest: true
    });

    const summaryMap = {};

    records.forEach(record => {
        const empId = record.employee_id;

        // 1. Nếu nhân viên chưa có trong danh sách thì tạo mới
        if (!summaryMap[empId]) {
            summaryMap[empId] = {
                employee_code: record.employee?.employee_code || 'N/A',
                full_name: record.employee?.full_name || 'N/A',
                position: record.employee?.position || 'N/A',
                department: record.employee?.department?.name || 'Chưa set',
                days: {}, // Object chứa dữ liệu từng ngày
                total_work_days: 0,
            };

            // Khởi tạo sẵn 31 ngày trống cho đẹp đội hình
            for (let i = 1; i <= daysInMonth; i++) {
                summaryMap[empId].days[i] = '';
            }
        }

        // 2. Lấy ra cái "ngày" của bản ghi hiện tại (vd: "2026-04-15" -> số 15)
        const dayNum = new Date(record.work_date).getDate();

        // 3. Quyết định hiển thị gì vào ô ngày đó (Giống form Khải Hưng)
        if (record.status === 'ABSENT') {
            summaryMap[empId].days[dayNum] = 'V'; // Vắng
        } else if (record.status === 'PRESENT' || record.status === 'LATE' || record.status === 'MISSING_OUT') {
            // Hiển thị công (có thể là 1.0 hoặc số giờ làm thực tế)
            const workValue = record.net_work_hours;
            summaryMap[empId].days[dayNum] = workValue;
            summaryMap[empId].total_work_days += workValue;
        }
    });

    return Object.values(summaryMap).sort((a, b) => a.employee_code.localeCompare(b.employee_code));
};


export default { getEmployeeAttendanceByDate, getAllAttendanceSummaryByDate, getEmployeeAttendanceSummaryByMonth, processScanLog, finalizeDailyAttendance, getMonthlySummaryAllEmployees };