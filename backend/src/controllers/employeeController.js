import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const getAllEmployees = async (req, res) => {
    try {
        const employees = await db.Employee.findAll({
            attributes: { exclude: ['password_hash'] },
            include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'] }],
            raw: true,  // Trả về object thuần, bỏ qua bước build Model Instance
            nest: true  // Gộp các object include lại cho gọn gàng
        });
        return res.status(200).json({ success: true, data: employees });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const createEmployee = async (req, res) => {
    try {
        const { employee_code, full_name, email, password, department_id, position, role } = req.body;

        if (!employee_code || !full_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin bắt buộc!' });
        }

        const existingCode = await db.Employee.findOne({ where: { employee_code } });
        if (existingCode) {
            return res.status(400).json({ success: false, message: 'Mã nhân viên đã tồn tại!' });
        }

        const existingEmail = await db.Employee.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newEmployee = await db.Employee.create({
            employee_code, full_name, email, password_hash, department_id: department_id || null, position, role: role || 'EMPLOYEE'
        });

        // Hide password hash
        const responseData = newEmployee.toJSON();
        delete responseData.password_hash;

        return res.status(201).json({ success: true, message: 'Tạo nhân viên thành công!', data: responseData });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, department_id, position, role, is_active } = req.body;

        const employee = await db.Employee.findByPk(id);
        if (!employee) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên!' });

        if (email && email !== employee.email) {
            const existingEmail = await db.Employee.findOne({ where: { email } });
            if (existingEmail) return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });
        }

        await employee.update({ full_name, email, department_id: department_id || null, position, role, is_active });
        return res.status(200).json({ success: true, message: 'Cập nhật nhân viên thành công!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await db.Employee.findByPk(id);
        if (!employee) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên!' });

        await employee.destroy();
        return res.status(200).json({ success: true, message: 'Xoá nhân viên thành công!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

export default { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };
