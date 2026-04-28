import db from '../../models/index.js';
import fs from 'fs';
import path from 'path';
import fileUtils from '../../utils/fileUtils.js';
import fingerprintService from '../../services/fingerprintService.js';
import attendanceService from '../../services/attendanceService.js';
import { uploadBase64ToCloudinary } from '../../utils/cloudinaryUpload.js';

export const handleAttendanceEvents = (socket, io) => {

    // =====================================================================
    // 1. NHẬN ĐIỂM DANH ONLINE (REALTIME)
    // =====================================================================
    socket.on('attendance_scan', async (data) => {
        console.log(`=> [Chấm công Online] ID nhận được: ${data.employee_code} lúc ${data.scan_time}`);

        // Phân loại trạng thái và ID để lưu DB
        const isUnknown = String(data.employee_id).includes('Unknown_ID');
        const dbEmployeeId = isUnknown ? null : data.employee_id;
        const dbStatus = isUnknown ? 'FAILED' : 'SUCCESS';

        try {
            const imageURL = await uploadBase64ToCloudinary(data.image_data, 'attendance_logs');
            await fingerprintService.createScanLog({
                employee_id: dbEmployeeId,
                scan_time: data.scan_time,
                image_path: imageURL,
                status: dbStatus
            });
            const result = await attendanceService.processScanLog(data.employee_id, data.scan_time);
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
                const imageURL = await uploadBase64ToCloudinary(log.image_data, 'attendance_logs');

                await fingerprintService.createScanLog({
                    employee_id: dbEmployeeId,
                    scan_time: log.scan_time,
                    image_path: imageURL,
                    status: dbStatus
                });

                const result = await attendanceService.processScanLog(log.employee_id, log.scan_time);
                console.log(result);
            } catch (error) {
                console.error(`❌ Lỗi lưu đồng bộ offline cho dữ liệu ${log.employee_id}:`, error);
            }
        }
        console.log("✅ Đã đồng bộ xong dữ liệu Offline vào DB!");
    });

};