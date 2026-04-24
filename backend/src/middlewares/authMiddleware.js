import jwt from 'jsonwebtoken';
import db from '../models/index.js';

require('dotenv').config();

const verifyToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy Token hoặc Token không hợp lệ!'
            });
        }

        // Extract the token without "Bearer "
        token = token.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

        // Find the user from database just to be safe
        const user = await db.Employee.findByPk(decoded.id, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng của Token này!'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token đã hết hạn hoặc không hợp lệ!'
        });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Yêu cầu quyền Admin để thực hiện thao tác này!'
        });
    }
};

const verifyManager = (req, res, next) => {
    if (req.user && (req.user.role === 'MANAGER' || req.user.role === 'ADMIN')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Yêu cầu quyền Manager để thực hiện thao tác này!'
        });
    }
};

const verifyEmployee = (req, res, next) => {
    const currentUser = req.user; // Dữ liệu user từ middleware verifyToken
    const employee_id = req.params.employee_id;

    // ⚠️ BẢO MẬT: Nhân viên chỉ được xem dữ liệu của chính mình
    if (currentUser.role === 'EMPLOYEE' && currentUser.id !== employee_id) {
        return res.status(403).json({
            success: false,
            message: 'Truy cập bị từ chối: Bạn không thể xem dữ liệu của người khác.'
        });
    }
    else {
        next();
    }
};

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyManager,
    verifyEmployee
};
