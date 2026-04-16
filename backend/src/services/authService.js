import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const loginService = async (employee_code, password) => {
    const user = await db.Employee.findOne({ where: { employee_code } });

    if (!user) {
        // Ném lỗi kèm status code để Controller tự biết đường xử lý
        throw { status: 401, message: 'Sai mã nhân viên hoặc password!' };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw { status: 401, message: 'Sai mã nhân viên hoặc password!' };
    }

    const token = jwt.sign(
        { id: user.id, department_id: user.department_id, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '1d' }
    );

    return {
        token,
        user: {
            id: user.id,
            employee_code: user.employee_code,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            position: user.position
        }
    };
};

const getMeService = async (user_id) => {
    const user = await db.Employee.findByPk(user_id, {
        attributes: { exclude: ['password_hash'] },
        include: [{
            model: db.Department,
            as: 'department',
            attributes: ['id', 'name']
        }],
        raw: true,
        nest: true
    });

    if (!user) {
        throw { status: 404, message: 'Người dùng không tồn tại!' };
    }

    return user;
};

const changePasswordService = async (user_id, old_password, new_password) => {
    const user = await db.Employee.findByPk(user_id, { raw: false });

    if (!user) {
        throw { status: 404, message: 'Không tìm thấy người dùng!' };
    }

    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) {
        throw { status: 401, message: 'Mật khẩu cũ không đúng!' };
    }

    const hashed_password = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash: hashed_password });

    return true; // Trả về true báo hiệu thành công
};

export default { loginService, getMeService, changePasswordService };