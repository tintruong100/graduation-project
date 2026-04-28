import db from '../models/index.js';
import { getIO } from "../sockets/socketHandler.js";
import { requestPiToScanFingerprint } from '../sockets/handlers/fingerprintHandler.js';

const getAll = async () => {
    const fingerprints = await db.Fingerprint.findAll({
        include: [
            { model: db.Employee, as: 'employee', attributes: ['id', 'full_name', 'employee_code'] }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
    });
    return fingerprints;
}

const update = async (id, finger_name) => {
    const fingerprint = await db.Fingerprint.findByPk(id, { raw: false });
    if (!fingerprint) throw { status: 404, message: 'Không tìm thấy vân tay!' };
    const updatedFingerprint = await fingerprint.update({ finger_name });
    return updatedFingerprint;
}

const remove = async (id) => {
    const fingerprint = await db.Fingerprint.findByPk(id, { raw: false });
    if (!fingerprint) throw { status: 404, message: 'Không tìm thấy vân tay!' };

    const sensorIdToSync = fingerprint.sensor_id; // Lưu lại ID trước khi xóa
    await fingerprint.destroy();

    const io = getIO();
    io.emit('command_delete_fingerprint', { sensorId: sensorIdToSync });
    io.emit('force_sync_local_db');
}

const create = async (employee_id, finger_name) => {
    if (!employee_id) throw { status: 400, message: 'ID nhân viên là bắt buộc!' };
    if (!finger_name) throw { status: 400, message: 'Tên ngón tay là bắt buộc!' };

    const fingerprintData = await requestPiToScanFingerprint(employee_id, finger_name);

    if (!fingerprintData.success) {
        throw { status: 400, message: 'Quét vân tay trên thiết bị thất bại!', error: fingerprintData.error };
    }

    const newFingerprint = await db.Fingerprint.create({
        employee_id: fingerprintData.data.employee_id,
        finger_name: fingerprintData.data.finger_name,
        sensor_id: fingerprintData.data.sensor_id,
        template_data: fingerprintData.data.template_data
    });

    const io = getIO();
    io.emit('force_sync_local_db');

    return newFingerprint;
}

const getScanLog = async () => {
    const scanLogs = await db.ScanLog.findAll({
        include: [
            { model: db.Employee, as: 'employee', attributes: ['id', 'full_name', 'employee_code'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: 1000,
        raw: true,
        nest: true
    });
    return scanLogs;
}

const getAllFingerprintsForSync = async () => {
    const fingerprintsRaw = await db.Fingerprint.findAll({
        attributes: ['sensor_id', 'employee_id', 'template_data'],
        include: [
            {
                model: db.Employee,
                as: 'employee',
                attributes: ['full_name', 'employee_code', 'custom_start_time', 'custom_end_time'],
                include: [
                    {
                        model: db.Department,
                        as: 'department',
                        attributes: ['start_time', 'end_time'] // Đã xóa khoảng trắng dư
                    }
                ]
            }
        ],
        raw: true, nest: true
    });
    return fingerprintsRaw.map(fp => ({
        sensor_id: fp.sensor_id,
        employee_id: fp.employee_id,
        full_name: fp.employee.full_name,
        employee_code: fp.employee.employee_code,
        template_data: fp.template_data,
        start_time: fp.employee.custom_start_time || fp.employee.department.start_time || '08:00',
        end_time: fp.employee.custom_end_time || fp.employee.department.end_time || '17:00'
    }));
};

const createScanLog = async (data) => {
    const { employee_id, scan_time, image_path, status } = data;

    await db.ScanLog.create({
        employee_id: employee_id,
        scan_time: scan_time,
        image_path: image_path || null,
        status: status
    });

    //Xu ly cham cong sau khi tao log

};

export default { getAll, update, remove, create, getScanLog, getAllFingerprintsForSync, createScanLog };