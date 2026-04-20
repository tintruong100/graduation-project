const db = require('../models/index.js');

const getAll = async () => {
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
    return departmentsWithEmployees;
}

const create = async (name, manager_id, start_time, end_time) => {
    if (!name) {
        throw { status: 400, message: 'Tên phòng ban là bắt buộc!' };
    }
    const dept = await db.Department.create({ name, manager_id: manager_id || null, start_time, end_time });
    return dept;
}

const update = async (id, name, manager_id, start_time, end_time) => {
    const dept = await db.Department.findByPk(id, {
        raw: false,
    });
    if (!dept) throw { status: 404, message: 'Không tìm thấy phòng ban!' };
    await dept.update({ name, manager_id: manager_id || null, start_time, end_time });
    return dept;
}

const remove = async (id) => {
    const dept = await db.Department.findByPk(id, {
        raw: false
    });
    if (!dept) throw { status: 404, message: 'Không tìm thấy phòng ban!' };

    const employeeCount = await db.Employee.count({
        where: { department_id: id }
    });

    if (employeeCount > 0) {
        throw { status: 400, message: `Không thể xóa! Hiện đang có ${employeeCount} nhân viên thuộc phòng ban này. Vui lòng thuyên chuyển nhân viên trước.` };
    }
    await dept.destroy();
}
export default { getAll, create, update, remove };