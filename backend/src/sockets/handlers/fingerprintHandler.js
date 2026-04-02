import db from '../../models/index.js'; // Cập nhật đúng đường dẫn trỏ về model
import { getIO } from "../socketHandler.js";
import { EventEmitter } from 'events';

const internalBus = new EventEmitter();

export const handleFingerprintEvents = (socket, io) => {

    // Việc 1: Pi yêu cầu Server gửi toàn bộ data vân tay để lưu vào file txt
    socket.on('request_sync_data', async () => {
        console.log(`=> [Đồng bộ] Pi (socket id: ${socket.id}) yêu cầu tải dữ liệu vân tay mới nhất.`);
        try {
            // SỬ DỤNG COMBO: raw: true VÀ nest: true
            const fingerprintsRaw = await db.Fingerprint.findAll({
                attributes: ['sensor_id', 'employee_id', 'template_data'],
                include: [
                    { model: db.Employee, as: 'employee', attributes: ['full_name', 'employee_code'] }
                ],
                raw: true,   // Trả về object thuần
                nest: true   // Tự động gom nhóm bảng lồng nhau
            });

            // Vì raw: true nên nó là mảng object thuần luôn, KHÔNG cần fp.toJSON() nữa!
            const fingerprints = fingerprintsRaw.map(fp => {
                return {
                    sensor_id: fp.sensor_id,
                    employee_id: fp.employee_id,
                    full_name: fp.employee ? fp.employee.full_name : 'Unknown',
                    employee_code: fp.employee ? fp.employee.employee_code : 'Unknown',
                    template_data: fp.template_data
                };
            });

            // Gửi trả lại cho Pi
            socket.emit('sync_data_response', fingerprints);
            console.log(`Đã gửi ${fingerprints.length} mẫu vân tay xuống Pi.`);
        } catch (error) {
            console.error("Lỗi đồng bộ dữ liệu với Pi:", error);
        }
    });

    socket.on('pi_enrollment_result', (payload) => {
        console.log(`=> [Nhận Vân Tay] Pi gửi dữ liệu lên cho NV: ${payload.data?.employee_id}`);
        // Kích hoạt trạm trung chuyển nội bộ để đánh thức Promise
        internalBus.emit(`scan_result_${payload.data?.employee_id}`, payload);
    });

};

/**
 * Hàm yêu cầu Pi kích hoạt module cảm biến và chờ kết quả
 * @param {string} employee_id - Mã nhân viên
 * @param {string} finger_name - Tên ngón tay (ví dụ: Ngón trỏ trái)
 * @returns {Promise<Object>} - Trả về dữ liệu vân tay từ thiết bị
 */

export const requestPiToScanFingerprint = (employee_id, finger_name) => {
    return new Promise((resolve, reject) => {
        try {
            const io = getIO();
            const internalEventName = `scan_result_${employee_id}`;

            const timeoutId = setTimeout(() => {
                internalBus.removeAllListeners(internalEventName);
                reject(new Error('Quá thời gian chờ! Người dùng không đặt tay vào máy quét.'));
            }, 30000);

            const listener = (dataFromPi) => {
                clearTimeout(timeoutId);
                internalBus.removeAllListeners(internalEventName); // Dọn dẹp bộ nhớ
                resolve(dataFromPi);
            };

            // 4. Lắng nghe từ internalBus thay vì 'io'
            internalBus.once(internalEventName, listener);

            // Ra lệnh cho Pi (Không cần truyền response_event nữa)
            io.emit('command_start_register', {
                employee_id: employee_id,
                finger_name: finger_name
            });

            console.log(`[Socket] Đã gửi lệnh yêu cầu quét vân tay cho ID: ${employee_id}`);

        } catch (error) {
            reject(new Error(`Lỗi kết nối Socket: ${error.message}`));
        }
    });
};