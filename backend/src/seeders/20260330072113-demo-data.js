'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Khởi tạo sẵn các UUID để dễ dàng liên kết (JOIN) các bảng với nhau
    const deptITId = uuidv4();
    const deptHRId = uuidv4();

    const empDaoId = uuidv4();
    const empThanhId = uuidv4();

    // Mã hóa mật khẩu chung là '123456' cho dễ test
    const passwordHash = await bcrypt.hash('123456', 10);

    // ===============================================
    // 1. TẠO PHÒNG BAN (Để manager_id = null tạm thời)
    // ===============================================
    await queryInterface.bulkInsert('departments', [
      {
        id: deptITId,
        name: 'Phòng Công Nghệ (IT)',
        manager_id: null,
        start_time: '08:00:00',
        end_time: '17:00:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: deptHRId,
        name: 'Phòng Hành Chính Nhân Sự',
        manager_id: null,
        start_time: '08:00:00',
        end_time: '17:00:00',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ===============================================
    // 2. TẠO NHÂN VIÊN
    // ===============================================
    await queryInterface.bulkInsert('employees', [
      {
        id: empDaoId,
        employee_code: '21109110', // MSSV
        full_name: 'Lê Ngọc Đào',
        email: 'dao.le@example.com',
        password_hash: passwordHash,
        date_of_birth: '2003-04-13',
        gender: true,
        phone_number: '0901234567',
        address: 'TP.HCM',
        department_id: deptITId,
        position: 'Trưởng phòng IT',
        role: 'ADMIN', // Quyền cao nhất trên Web
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: empThanhId,
        employee_code: '21109999',
        full_name: 'Lê Nguyễn Phước Thanh',
        email: 'thanh.le@example.com',
        password_hash: passwordHash,
        date_of_birth: '2003-05-20',
        gender: true,
        phone_number: '0909876543',
        address: 'TP.HCM',
        department_id: deptITId,
        position: 'Lập trình viên',
        role: 'EMPLOYEE',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ===============================================
    // 3. CẬP NHẬT TRƯỞNG PHÒNG CHO PHÒNG IT
    // ===============================================
    await queryInterface.bulkUpdate(
      'departments',
      { manager_id: empDaoId }, // Đưa Lê Ngọc Đào lên làm trưởng phòng
      { id: deptITId }
    );

    // ===============================================
    // 4. TẠO DỮ LIỆU VÂN TAY (Giả lập đã lấy vân tay từ cảm biến)
    // ===============================================
    await queryInterface.bulkInsert('fingerprints', [
      {
        id: uuidv4(),
        employee_id: empDaoId,
        finger_name: 'Ngón cái phải',
        sensor_id: 1, // ID lưu trên mạch AS608
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        employee_id: empThanhId,
        finger_name: 'Ngón trỏ trái',
        sensor_id: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ===============================================
    // 5. TẠO LỊCH SỬ QUÉT (Giả lập log chấm công buổi sáng)
    // ===============================================
    const today = new Date();
    today.setHours(7, 45, 0, 0); // Quét lúc 07:45 sáng (Đi làm sớm)

    await queryInterface.bulkInsert('scan_logs', [
      {
        id: uuidv4(),
        employee_id: empDaoId,
        scan_time: today,
        image_path: '/uploads/attendance/2026-03-30/dao_capture.jpg',
        status: 'SUCCESS',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Xóa theo thứ tự ngược lại để không dính lỗi khóa ngoại
    await queryInterface.bulkDelete('scan_logs', null, {});
    await queryInterface.bulkDelete('fingerprints', null, {});

    // Gỡ Trưởng phòng ra trước khi xóa Nhân viên
    await queryInterface.bulkUpdate('departments', { manager_id: null }, {});

    await queryInterface.bulkDelete('employees', null, {});
    await queryInterface.bulkDelete('departments', null, {});
  }
};