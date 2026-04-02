import db from '../../models/index.js';
import fs from 'fs';
import path from 'path';

export const handleAttendanceEvents = (socket, io) => {

    const saveImageFromBase64 = (employeeId, base64Data) => {
        if (!base64Data) return null;

        try {
            // Đổi employeeId thành string an toàn cho tên file (VD: Unknown_ID_7)
            const safeId = String(employeeId).replace(/[^a-zA-Z0-9_-]/g, '');
            const filename = `attendance_${safeId}_${Date.now()}.jpg`;
            const saveDirectory = path.join(process.cwd(), 'public', 'images');

            if (!fs.existsSync(saveDirectory)) {
                fs.mkdirSync(saveDirectory, { recursive: true });
            }

            const filePath = path.join(saveDirectory, filename);
            const imageBuffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filePath, imageBuffer);

            return `/images/${filename}`;
        } catch (error) {
            console.error("Lỗi khi giải mã và lưu file ảnh:", error);
            return null;
        }
    };

    // =====================================================================
    // 1. NHẬN ĐIỂM DANH ONLINE (REALTIME)
    // =====================================================================
    socket.on('attendance_scan', async (data) => {
        console.log(`=> [Chấm công Online] ID nhận được: ${data.employee_id} lúc ${data.scan_time}`);

        // Phân loại trạng thái và ID để lưu DB
        const isUnknown = String(data.employee_id).includes('Unknown_ID');
        const dbEmployeeId = isUnknown ? null : data.employee_id;
        const dbStatus = isUnknown ? 'FAILED' : 'SUCCESS';

        try {
            // Vẫn chụp và lưu ảnh bình thường (Để bắt quả tang kẻ gian)
            const savedImagePath = saveImageFromBase64(data.employee_id, data.image_data);

            await db.ScanLog.create({
                employee_id: dbEmployeeId, // Sẽ là null nếu là vân tay lạ
                scan_time: data.scan_time,
                image_path: savedImagePath,
                status: dbStatus // SUCCESS hoặc FAILED
            });

            if (isUnknown) {
                console.log(`⚠️ Đã ghi nhận một lượt quét KHÔNG HỢP LỆ vào hệ thống!`);
            } else {
                console.log("✅ Đã ghi nhận điểm danh thành công!");
            }
        } catch (error) {
            console.error("❌ Lỗi lưu điểm danh:", error);
        }
    });

    // =====================================================================
    // 2. NHẬN ĐIỂM DANH OFFLINE (KHI PI CÓ MẠNG TRỞ LẠI)
    // =====================================================================
    socket.on('sync_offline_attendance', async (logsArray) => {
        console.log(`=> [Chấm công Offline] Nhận ${logsArray.length} bản ghi cũ từ Pi để đồng bộ.`);

        for (let log of logsArray) {
            const isUnknown = String(log.employee_id).includes('Unknown_ID');
            const dbEmployeeId = isUnknown ? null : log.employee_id;
            const dbStatus = isUnknown ? 'FAILED' : 'SUCCESS';

            try {
                const savedImagePath = saveImageFromBase64(log.employee_id, log.image_data);

                await db.ScanLog.create({
                    employee_id: dbEmployeeId,
                    scan_time: log.scan_time,
                    image_path: savedImagePath,
                    status: dbStatus
                });
            } catch (error) {
                console.error(`❌ Lỗi lưu đồng bộ offline cho dữ liệu ${log.employee_id}:`, error);
            }
        }
        console.log("✅ Đã đồng bộ xong dữ liệu Offline vào DB!");
    });

};