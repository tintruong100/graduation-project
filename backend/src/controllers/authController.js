import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const login = async (req, res) => {
    try {
        const { employee_code, password } = req.body;
        if (!employee_code || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã nhân viên và password!' });
        }

        const user = await db.Employee.findOne({
            where: { employee_code }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Sai mã nhân viên hoặc password!' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Sai mã nhân viên hoặc password!' });
        }

        // TỐI ƯU: Đưa id (UUID) vào token thay vì employee_code
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token,
                user: {
                    id: user.id,
                    employee_code: user.employee_code,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    position: user.position // Trả thêm chức vụ cho Web hiển thị
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        // Giả định authMiddleware của em đã decode token và nhét id vào req.user
        // Dùng findByPk để lấy dữ liệu mới nhất từ DB
        const user = await db.Employee.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }, // Không bao giờ trả về password_hash
            include: [
                {
                    model: db.Department,
                    as: 'department',
                    attributes: ['id', 'name'] // Lấy thêm thông tin phòng ban
                }
            ],
            raw: true,  // Trả về object thuần, bỏ qua bước build Model Instance
            nest: true  // Gộp các object include lại cho gọn gàng
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại!' });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        // TỐI ƯU: Lấy UUID từ req.user (do middleware truyền sang)
        const user_id = req.user.id;

        if (!old_password || !new_password) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đủ mật khẩu cũ và mới!' });
        }

        // Lúc này dùng findByPk với UUID là hoàn toàn hợp lệ
        const user = await db.Employee.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
        }

        const isMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mật khẩu cũ không đúng!' });
        }

        // Tối ưu hàm băm: genSalt(10) là chuẩn, hoặc có thể truyền thẳng số vòng lặp vào hàm hash
        const hashed_password = await bcrypt.hash(new_password, 10);

        await user.update({ password_hash: hashed_password });

        return res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công!'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

export default { login, getMe, changePassword };