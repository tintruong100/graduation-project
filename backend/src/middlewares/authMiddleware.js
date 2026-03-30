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
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Yêu cầu quyền Admin để thực hiện thao tác này!'
        });
    }
};

module.exports = {
    verifyToken,
    verifyAdmin
};
