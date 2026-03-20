import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và password!' });
        }

        const user = await db.User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Sai email hoặc password!' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Sai email hoặc password!' });
        }

        // Generate token
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = req.user; // Set by authMiddleware
        return res.status(200).json({
            success: true,
            data: {
                user_id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const user_id = req.user.user_id;

        if (!old_password || !new_password) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đủ mật khẩu cũ và mới!' });
        }

        const user = await db.User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
        }

        const isMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mật khẩu cũ không đúng!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(new_password, salt);

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
