import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import stringUtils from '../utils/stringUtils.js';

const { Op } = require('sequelize');

const getAll = async () => {
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
    return employees;
}

const getAllByDepartment = async (department_id) => {
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
    return employees;
}

const generateUniqueEmployeeCode = async (fullName) => {
    const baseCode = stringUtils.generateBaseCode(fullName);

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

const create = async (employeeData) => {
    const { full_name, email, password, date_of_birth, gender, phone_number, address, department_id, position, role } = employeeData;

    if (!full_name || !email || !password) {
        throw { status: 400, message: 'Tên nhân viên, email và mật khẩu là bắt buộc!' };
    }

    const newCode = await generateUniqueEmployeeCode(full_name);

    const password_hash = await bcrypt.hash(password, 10);

    const newEmployee = await db.Employee.create({
        employee_code: newCode, full_name, email, password_hash, date_of_birth, gender, phone_number, address, department_id: department_id || null, position, role: role || 'EMPLOYEE'
    });

    // Hide password hash
    delete newEmployee.dataValues.password_hash;
    return newEmployee;
}

const update = async (employeeData, id) => {
    const { full_name, email, date_of_birth, gender, phone_number, address, department_id, position, role, is_active } = employeeData;
    const employee = await db.Employee.findByPk(id, {
        raw: false,
    });
    if (!employee) throw { status: 404, message: 'Không tìm thấy nhân viên!' };
    if (email && email !== employee.email) {
        const existingEmail = await db.Employee.findOne({ where: { email } });
        if (existingEmail) throw { status: 400, message: 'Email đã tồn tại!' };
    }
    const updatedEmployee = await employee.update({ full_name, email, date_of_birth, gender, phone_number, address, department_id: department_id || null, position, role: role || 'EMPLOYEE', is_active });
    delete updatedEmployee.dataValues.password_hash;
    return updatedEmployee;
}

const remove = async (id) => {
    const employee = await db.Employee.findByPk(id, {
        raw: false
    });
    if (!employee) throw { status: 404, message: 'Không tìm thấy nhân viên!' };
    await employee.destroy();
}
export default { getAll, getAllByDepartment, create, update, remove };