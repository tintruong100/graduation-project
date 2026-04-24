import departmentService from '../services/departmentService.js';

const getAllDepartments = async (req, res) => {
    try {
        const data = await departmentService.getAll();
        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { name, manager_id, start_time, end_time } = req.body;
        const dept = await departmentService.create(name, manager_id, start_time, end_time);
        return res.status(201).json({ success: true, message: 'Tạo phòng ban thành công!', data: dept });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, manager_id, start_time, end_time } = req.body;
        const dept = await departmentService.update(id, name, manager_id, start_time, end_time);
        return res.status(200).json({ success: true, message: 'Cập nhật phòng ban thành công!', data: dept });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        await departmentService.remove(id);
        return res.status(200).json({ success: true, message: 'Xóa phòng ban thành công!' });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

export default { getAllDepartments, createDepartment, updateDepartment, deleteDepartment };
