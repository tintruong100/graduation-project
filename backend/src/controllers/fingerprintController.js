import db from '../models/index.js';
import { getIO } from "../sockets/socketHandler.js";
import { requestPiToScanFingerprint } from '../sockets/handlers/fingerprintHandler.js';
import { get } from 'node:http';

const getAllFingerprints = async (req, res) => {
    try {
        const fingerprints = await db.Fingerprint.findAll({
            include: [
                { model: db.Employee, as: 'employee', attributes: ['id', 'full_name', 'employee_code'] }
            ],
            order: [['createdAt', 'DESC']],
            raw: true,
            nest: true
        });
        return res.status(200).json({ success: true, data: fingerprints });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const updateFingerprint = async (req, res) => {
    try {
        const { id } = req.params;
        const { finger_name, sensor_id, template_data } = req.body;

        const fingerprint = await db.Fingerprint.findByPk(id, { raw: false });
        if (!fingerprint) return res.status(404).json({ success: false, message: 'Không tìm thấy vân tay!' });

        await fingerprint.update({ finger_name, sensor_id, template_data });
        return res.status(200).json({ success: true, message: 'Cập nhật vân tay thành công!', data: fingerprint });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const deleteFingerprint = async (req, res) => {
    try {
        const { id } = req.params;
        const fingerprint = await db.Fingerprint.findByPk(id, { raw: false });
        if (!fingerprint) return res.status(404).json({ success: false, message: 'Không tìm thấy vân tay!' });

        const sensorIdToSync = fingerprint.sensor_id; // Lưu lại ID trước khi xóa

        await fingerprint.destroy();

        // [Bổ sung Việc 4]: Sau khi xóa DB, ra lệnh cho Raspberry Pi xóa file txt lưu trữ cục bộ
        const io = getIO();
        io.emit('command_delete_fingerprint', { sensorId: sensorIdToSync });
        io.emit('force_sync_local_db');

        return res.status(200).json({ success: true, message: 'Xóa vân tay thành công và đã đồng bộ xuống thiết bị!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const scanAndCreateFingerprint = async (req, res) => {
    try {
        const { employee_id, finger_name } = req.body;

        if (!employee_id) return res.status(400).json({ success: false, message: 'ID nhân viên là bắt buộc!' });
        if (!finger_name) return res.status(400).json({ success: false, message: 'Tên ngón tay là bắt buộc!' });

        const fingerprintData = await requestPiToScanFingerprint(employee_id, finger_name);

        if (!fingerprintData.success) {
            return res.status(400).json({
                success: false,
                message: 'Quét vân tay trên thiết bị thất bại!',
                error: fingerprintData.error
            });
        }

        // 3. Nếu thành công, lưu data Pi gửi lên vào Database
        const newFingerprint = await db.Fingerprint.create({
            employee_id: fingerprintData.data.employee_id,
            finger_name: fingerprintData.data.finger_name,
            sensor_id: fingerprintData.data.sensor_id,
            template_data: fingerprintData.data.template_data
        });

        const io = getIO();
        io.emit('force_sync_local_db');

        // 4. Trả kết quả về cho Frontend Next.js
        return res.status(201).json({
            success: true,
            message: 'Quét và tạo vân tay thành công!',
            data: newFingerprint
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống!', error: error.message });
    }
}

const getAllScanLog = async (req, res) => {
    try {
        const scanLogs = await db.ScanLog.findAll({
            include: [
                { model: db.Employee, as: 'employee', attributes: ['id', 'full_name', 'employee_code'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 100,
            raw: true,
            nest: true
        });
        return res.status(200).json({ success: true, data: scanLogs });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
}

export default { getAllFingerprints, scanAndCreateFingerprint, updateFingerprint, deleteFingerprint, getAllScanLog };