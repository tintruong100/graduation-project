import db from '../models/index.js';

const getAllFingerprints = async (req, res) => {
    try {
        const fingerprints = await db.Fingerprint.findAll({
            include: [
                { model: db.Employee, as: 'employee', attributes: ['id', 'full_name', 'employee_code'] }
            ],
            order: [
                ['createdAt', 'DESC']
            ],
            raw: true,
            nest: true
        });
        console.log('Fingerprints:', fingerprints);
        return res.status(200).json({ success: true, data: fingerprints });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const createFingerprint = async (req, res) => {
    try {
        const { employee_id, finger_name, sensor_id, template_data } = req.body;
        if (!employee_id) return res.status(400).json({ success: false, message: 'ID nhân viên là bắt buộc!' });
        if (!sensor_id) return res.status(400).json({ success: false, message: 'ID cảm biến là bắt buộc!' });

        const fingerprint = await db.Fingerprint.create({ employee_id, finger_name, sensor_id, template_data });
        return res.status(201).json({ success: true, message: 'Tạo vân tay thành công!', data: fingerprint });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const updateFingerprint = async (req, res) => {
    try {
        const { id } = req.params;
        const { finger_name, sensor_id, template_data } = req.body;

        const fingerprint = await db.Fingerprint.findByPk(id, {
            raw: false,
        });
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
        const fingerprint = await db.Fingerprint.findByPk(id, {
            raw: false
        });
        if (!fingerprint) return res.status(404).json({ success: false, message: 'Không tìm thấy vân tay!' });

        await fingerprint.destroy();
        return res.status(200).json({ success: true, message: 'Xóa vân tay thành công!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

export default { getAllFingerprints, createFingerprint, updateFingerprint, deleteFingerprint };
