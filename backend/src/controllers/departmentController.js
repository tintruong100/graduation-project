import db from '../models/index.js';

const getAllDepartments = async (req, res) => {
    try {
        const departments = await db.Department.findAll({
            include: [
                { model: db.Employee, as: 'manager', attributes: ['id', 'full_name', 'employee_code'] }
            ],
            order: [
                ['name', 'ASC'] // Sắp xếp theo cột name tăng dần
                // Nếu muốn mới nhất lên đầu thì đổi 'ASC' thành 'DESC'
            ],
            raw: true,
            nest: true
        });

        // Lấy danh sách nhân viên để đếm số lượng cho mỗi phòng ban
        const allEmployees = await db.Employee.findAll({
            attributes: ['id', 'department_id'],
            raw: true
        });

        // Gắn danh sách employees vào mỗi department
        const departmentsWithEmployees = departments.map(dept => {
            return {
                ...dept,
                employees: allEmployees.filter(emp => emp.department_id === dept.id)
            };
        });

        return res.status(200).json({ success: true, data: departmentsWithEmployees });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { name, manager_id, start_time, end_time } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Tên phòng ban là bắt buộc!' });

        const dept = await db.Department.create({ name, manager_id: manager_id || null, start_time, end_time });
        return res.status(201).json({ success: true, message: 'Tạo phòng ban thành công!', data: dept });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, manager_id, start_time, end_time } = req.body;

        const dept = await db.Department.findByPk(id, {
            raw: false,
        });
        if (!dept) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban!' });

        await dept.update({ name, manager_id: manager_id || null, start_time, end_time });
        return res.status(200).json({ success: true, message: 'Cập nhật phòng ban thành công!', data: dept });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const dept = await db.Department.findByPk(id, {
            raw: false
        });
        if (!dept) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban!' });

        const employeeCount = await db.Employee.count({
            where: { department_id: id }
        });

        if (employeeCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa! Hiện đang có ${employeeCount} nhân viên thuộc phòng ban này. Vui lòng thuyên chuyển nhân viên trước.`
            });
        }

        await dept.destroy();
        return res.status(200).json({ success: true, message: 'Xóa phòng ban thành công!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

export default { getAllDepartments, createDepartment, updateDepartment, deleteDepartment };
