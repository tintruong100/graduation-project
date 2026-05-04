const db = require('../models');
import dateUtils from '../utils/dateUtils';

const getDashboardSummaryData = async () => {
    // Lấy ngày hôm nay theo múi giờ Việt Nam
    const todayStr = dateUtils.getVietnamDateString(new Date());

    // 1. LẤY TỔNG SỐ NHÂN VIÊN, PHONG BAN, GIOI TÍNH
    const totalDepartments = await db.Department.count();

    // 2. Query 1 lần duy nhất vào bảng Employee bằng GROUP BY
    // CHỈ 1 LẦN QUERY DUY NHẤT VÀO BẢNG EMPLOYEE CHỨA TẤT CẢ THÔNG TIN
    const employeeStats = await db.Employee.findOne({
        attributes: [
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total'],
            [db.sequelize.fn('SUM', db.sequelize.literal(`CASE WHEN gender = 'true' THEN 1 ELSE 0 END`)), 'male'],
            [db.sequelize.fn('SUM', db.sequelize.literal(`CASE WHEN gender = 'false' THEN 1 ELSE 0 END`)), 'female'],
            [db.sequelize.fn('SUM', db.sequelize.literal(`CASE WHEN is_active = true THEN 1 ELSE 0 END`)), 'active']
        ],
        raw: true
    });

    // Ép kiểu dữ liệu về dạng số (vì lệnh SUM trong PostgreSQL thường trả về chuỗi)
    const totalEmployees = Number(employeeStats.total || 0);
    const totalMaleEmployees = Number(employeeStats.male || 0);
    const totalFemaleEmployees = Number(employeeStats.female || 0);
    const totalActiveEmployees = Number(employeeStats.active || 0);

    // 2. LẤY THỐNG KÊ CHẤM CÔNG HÔM NAY
    const todaySummaries = await db.AttendanceSummary.findAll({
        where: { work_date: todayStr }
    });

    let present = 0, late = 0, absent = 0, missingOut = 0;

    todaySummaries.forEach(record => {
        if (record.status === 'PRESENT') present++;
        else if (record.status === 'LATE') late++;
        else if (record.status === 'ABSENT') absent++;
        else if (record.status === 'MISSING_OUT') missingOut++;
    });

    const notScannedYet = totalEmployees - todaySummaries.length;
    const totalAbsentToday = absent + notScannedYet;

    // 3. LẤY LỊCH SỬ QUÉT MỚI NHẤT (5 dòng)
    const recentScans = await db.ScanLog.findAll({
        include: [
            { model: db.Employee, as: 'employee', attributes: ['id', 'full_name', 'employee_code'] }
        ],
        order: [['scan_time', 'DESC']],
        limit: 5,
        raw: true,
        nest: true
    });

    // 4. KIỂM TRA TRẠNG THÁI RASPBERRY PI THẬT (TỪ GLOBAL VARIABLE)
    // Nếu server vừa start, biến chưa được tạo thì mặc định là Offline
    const piStatus = global.piStatus || {
        is_online: false,
        last_active: null
    };

    // 5. ĐÓNG GÓI DỮ LIỆU
    return {
        today: {
            total: totalEmployees,
            active: totalActiveEmployees,
            department_count: totalDepartments,
            male_count: totalMaleEmployees,
            female_count: totalFemaleEmployees,
            present: present,
            late: late,
            absent: totalAbsentToday,
            missing_out: missingOut
        },
        recent_scans: recentScans,
        device_status: piStatus // <-- Gắn trạng thái thật vào đây
    };
};

export default {
    getDashboardSummaryData
};