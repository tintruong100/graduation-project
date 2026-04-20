import db from '../models/index.js';
import fingerprintService from '../services/fingerprintService.js';

const getAllFingerprints = async (req, res) => {
    try {
        const fingerprints = await fingerprintService.getAll();
        return res.status(200).json({ success: true, data: fingerprints });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const updateFingerprint = async (req, res) => {
    try {
        const { id } = req.params;
        const { finger_name } = req.body;
        const fingerprint = await fingerprintService.update(id, finger_name);
        return res.status(200).json({ success: true, message: 'Cập nhật vân tay thành công!', data: fingerprint });
    } catch (error) {
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Lỗi server!'
        });
    }
};

const deleteFingerprint = async (req, res) => {
    try {
        const { id } = req.params;
        await fingerprintService.remove(id);
        return res.status(200).json({ success: true, message: 'Xóa vân tay thành công và đã đồng bộ xuống thiết bị!' });
    } catch (error) {
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Lỗi server!'
        });
    }
};

const scanAndCreateFingerprint = async (req, res) => {
    try {
        const { employee_id, finger_name } = req.body;
        const newFingerprint = await fingerprintService.create(employee_id, finger_name);
        return res.status(201).json({
            success: true,
            message: 'Quét và tạo vân tay thành công!',
            data: newFingerprint
        });

    } catch (error) {
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Lỗi server!'
        });
    }
}

const getAllScanLog = async (req, res) => {
    try {
        const scanLogs = await fingerprintService.getScanLog();
        return res.status(200).json({ success: true, data: scanLogs });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
}

export default { getAllFingerprints, scanAndCreateFingerprint, updateFingerprint, deleteFingerprint, getAllScanLog };