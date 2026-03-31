import bcrypt from 'bcryptjs';
import db from '../models/index.js';


const getAllEmployees = async (req, res) => {
    try {
        const employees = await db.Employee.findAll({
            attributes: { exclude: ['password_hash'] },
            include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'] }],
            order: [
                ['employee_code', 'ASC'] // Sắp xếp theo cột employee_code tăng dần
                // Nếu muốn mới nhất lên đầu thì đổi 'ASC' thành 'DESC'
            ],
            raw: true,
            nest: true
        });
        return res.status(200).json({ success: true, data: employees });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const getAllEmployeesByDepartment = async (req, res) => {
    try {
        const { department_id } = req.params;
        const employees = await db.Employee.findAll({
            where: { department_id: department_id },
            attributes: { exclude: ['password_hash'] },
            include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'] }],
            order: [
                ['employee_code', 'ASC'] // Sắp xếp theo cột employee_code tăng dần
                // Nếu muốn mới nhất lên đầu thì đổi 'ASC' thành 'DESC'
            ],
            raw: true,
            nest: true
        });
        return res.status(200).json({ success: true, data: employees });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const { Op } = require('sequelize');

// 1. Hàm helper: Xóa dấu tiếng Việt
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

// 2. Hàm helper: Tạo mã gốc từ họ tên
function generateBaseCode(fullName) {
    // Xóa khoảng trắng thừa, đưa về chữ thường và bỏ dấu tiếng Việt
    const cleanName = removeVietnameseTones(fullName.trim().toLowerCase());

    // Tách các từ ra thành mảng (VD: ['ngo', 'truong', 'duc', 'tin'])
    const words = cleanName.split(/\s+/);

    if (words.length === 1) return words[0];

    const firstName = words.pop(); // Lấy từ cuối cùng (Tên chính: 'tin')
    const initials = words.map(word => word.charAt(0)).join(''); // Lấy chữ cái đầu của các từ còn lại ('n', 't', 'd' -> 'ntd')

    return firstName + initials; // Ghép lại: 'tin' + 'ntd' = 'tinntd'
}

// 3. Hàm chính: Sinh mã nhân viên duy nhất (Gọi hàm này trong Controller)
const generateUniqueEmployeeCode = async (fullName) => {
    const baseCode = generateBaseCode(fullName);

    // Truy vấn DB: Tìm TẤT CẢ nhân viên có mã bắt đầu bằng chữ 'tinntd'
    // Lưu ý: Sửa 'db.Employee' và 'employee_code' cho đúng với tên Model và cột trong DB của bạn
    const existingEmployees = await db.Employee.findAll({
        where: {
            employee_code: {
                [Op.like]: `${baseCode}%`
            }
        },
        attributes: ['employee_code']
    });

    // Nếu chưa có ai dùng mã này, trả về luôn mã gốc
    if (existingEmployees.length === 0) {
        return baseCode;
    }

    // Nếu đã có người dùng, tìm số đuôi lớn nhất
    let maxNumber = 0;
    // Regex để bóc tách phần số ở đuôi mã (VD: 'tinntd' -> 0, 'tinntd1' -> 1, 'tinntd2' -> 2)
    const regex = new RegExp(`^${baseCode}(\\d*)$`);

    existingEmployees.forEach(emp => {
        const match = emp.employee_code.match(regex);
        if (match) {
            // Nếu không có số ở đuôi (match[1] rỗng) tức là 'tinntd', ta ngầm hiểu nó là 0
            const num = match[1] === '' ? 0 : parseInt(match[1], 10);
            if (num > maxNumber) {
                maxNumber = num;
            }
        }
    });

    // Tạo mã mới bằng cách lấy số lớn nhất cộng thêm 1
    return `${baseCode}${maxNumber + 1}`;
};

const createEmployee = async (req, res) => {
    try {
        const { full_name, email, password, date_of_birth, gender, phone_number, address, department_id, position, role } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin bắt buộc!' });
        }

        const newCode = await generateUniqueEmployeeCode(full_name);

        const password_hash = await bcrypt.hash(password, 10);

        const newEmployee = await db.Employee.create({
            employee_code: newCode, full_name, email, password_hash, date_of_birth, gender, phone_number, address, department_id: department_id || null, position, role: role || 'EMPLOYEE'
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
        const { full_name, email, password, date_of_birth, gender, phone_number, address, department_id, position, role, is_active } = req.body;
        console.log('Received update data:', req.body);

        const employee = await db.Employee.findByPk(id, {
            raw: false,
        });
        if (!employee) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên!' });

        if (email && email !== employee.email) {
            const existingEmail = await db.Employee.findOne({ where: { email } });
            if (existingEmail) return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });
        }

        await employee.update({ full_name, email, password, date_of_birth, gender, phone_number, address, department_id: department_id || null, position, role, is_active });
        return res.status(200).json({ success: true, message: 'Cập nhật nhân viên thành công!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await db.Employee.findByPk(id, {
            raw: false
        });
        if (!employee) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên!' });

        await employee.destroy();
        return res.status(200).json({ success: true, message: 'Xoá nhân viên thành công!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server!', error: error.message });
    }
};

export default { getAllEmployees, createEmployee, updateEmployee, deleteEmployee, getAllEmployeesByDepartment };
