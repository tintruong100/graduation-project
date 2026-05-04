import { get } from 'node:http';
import attendanceService from '../services/attendanceService.js';
import dateUtils from '../utils/dateUtils.js';

// ==========================================
// 1. LẤY BẢNG CÔNG THEO THÁNG CỦA 1 NHÂN VIÊN (User/Admin đều dùng chung)
// Endpoint gợi ý: GET /api/attendance/monthly/:employee_id?month=4&year=2026
// ==========================================
const getMonthlyAttendance = async (req, res) => {
    try {
        const employee_id = req.params.employee_id;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const month = req.query.month ? parseInt(req.query.month) : currentMonth;
        const year = req.query.year ? parseInt(req.query.year) : currentYear;

        const data = await attendanceService.getEmployeeAttendanceSummaryByMonth(employee_id, month, year);

        return res.status(200).json({
            success: true,
            message: `Lấy dữ liệu chấm công tháng ${month}/${year} thành công.`,
            data: data
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

// ==========================================
// 2. LẤY TỔNG HỢP CÔNG CỦA CẢ CÔNG TY TRONG 1 NGÀY (Dành cho Admin/Manager)
// Endpoint gợi ý: GET /api/attendance/daily-all?date=2026-04-22
// ==========================================
const getDailySummaryAll = async (req, res) => {
    try {
        // Lấy ngày từ query, mặc định là ngày hôm nay nếu không truyền
        const work_date = req.query.date || dateUtils.getVietnamDateString(new Date());

        const data = await attendanceService.getAllAttendanceSummaryByDate(work_date);

        return res.status(200).json({
            success: true,
            message: `Lấy danh sách chấm công ngày ${work_date} thành công.`,
            data: data
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

// ==========================================
// 3. LẤY CHI TIẾT 1 NGÀY CỦA 1 NHÂN VIÊN
// Endpoint gợi ý: GET /api/attendance/daily/:employee_id?date=2026-04-22
// ==========================================
const getDailyAttendance = async (req, res) => {
    try {
        const employee_id = req.params.employee_id;
        const work_date = req.query.date || dateUtils.getVietnamDateString(new Date());

        const data = await attendanceService.getEmployeeAttendanceByDate(employee_id, work_date);

        return res.status(200).json({
            success: true,
            message: `Lấy chi tiết chấm công ngày ${work_date} thành công.`,
            data: data || null // Trả về null nếu hôm đó chưa chấm công
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

// ==========================================
// 4. [TÍNH NĂNG BONUS]: NÚT "CHỐT SỔ THỦ CÔNG" CHO ADMIN
// Endpoint gợi ý: POST /api/attendance/trigger-finalize?date=2026-04-22
// ==========================================
const triggerManualFinalize = async (req, res) => {
    try {
        const targetDate = req.query.date || dateUtils.getVietnamDateString(new Date());

        // Gọi thẳng hàm chốt sổ thay vì đợi Cronjob lúc nửa đêm
        const result = await attendanceService.finalizeDailyAttendance(targetDate);

        return res.status(200).json({
            success: true,
            message: `Đã chốt sổ thủ công thành công cho ngày ${targetDate}.`,
            data: result
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi khi chốt sổ!',
        });
    }
};

const getMonthlySummaryAll = async (req, res) => {
    try {
        const currentUser = req.user;

        const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        const data = await attendanceService.getMonthlySummaryAllEmployees(month, year);

        return res.status(200).json({
            success: true,
            message: `Lấy báo cáo chốt công tháng ${month}/${year} thành công.`,
            data: data
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

export default {
    getMonthlyAttendance,
    getDailySummaryAll,
    getDailyAttendance,
    triggerManualFinalize,
    getMonthlySummaryAll
};