import authService from '../services/authService.js';

const login = async (req, res) => {
    try {
        const { employee_code, password } = req.body;

        if (!employee_code || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã nhân viên và password!' });
        }

        // Đẩy hết việc nặng cho Service
        const data = await authService.loginService(employee_code, password);

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: data
        });
    } catch (error) {
        // Bắt lỗi từ Service ném ra (có sẵn status code)
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await authService.getMeService(req.user.id);

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        // Bắt lỗi từ Service ném ra (có sẵn status code)
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
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

        await authService.changePasswordService(user_id, old_password, new_password);

        return res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công!'
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

export default { login, getMe, changePassword };