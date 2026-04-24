import db from '../models/index.js';
import employeeService from '../services/employeeService.js';


const getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeService.getAll();
        return res.status(200).json({ success: true, data: employees });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

const getAllEmployeesByDepartment = async (req, res) => {
    try {
        const { department_id } = req.params;
        const employees = await employeeService.getAllByDepartment(department_id);
        return res.status(200).json({ success: true, data: employees });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};



const createEmployee = async (req, res) => {
    try {
        const employeeData = req.body;
        const newEmployee = await employeeService.create(employeeData);
        return res.status(201).json({ success: true, message: 'Tạo nhân viên thành công!', data: newEmployee });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeData = req.body;
        const updatedEmployee = await employeeService.update(employeeData, id);
        return res.status(200).json({ success: true, message: 'Cập nhật nhân viên thành công!', data: updatedEmployee });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await employeeService.remove(id);
        return res.status(200).json({ success: true, message: 'Xoá nhân viên thành công!' });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: error.message || 'Lỗi server!',
        });
    }
};

export default { getAllEmployees, createEmployee, updateEmployee, deleteEmployee, getAllEmployeesByDepartment };
