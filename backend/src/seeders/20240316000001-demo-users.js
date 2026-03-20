'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate hashed password "password123"
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);

    // Seed Users
    const users = await queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        password_hash: password_hash,
        full_name: 'System Admin',
        email: 'admin@university.edu.vn',
        role: 'admin',
        created_at: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'gv_nguyenvana',
        password_hash: password_hash,
        full_name: 'Nguyễn Văn A',
        email: 'nguyenvana@university.edu.vn',
        role: 'teacher',
        created_at: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'sv_21110000',
        password_hash: password_hash,
        full_name: 'Lê Văn Sinh',
        email: '21110000@student.university.edu.vn',
        role: 'student',
        created_at: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Seed Teachers (user_id = 2)
    // Note: If returning is not supported by dialect, might need raw query or specific id manually
    // But since we just seeded in empty DB, IDs will be 1, 2, 3
    await queryInterface.bulkInsert('Teachers', [{
      teacher_id: 'GV001',
      user_id: 2,
      department_name: 'Công Nghệ Thông Tin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Seed Students (user_id = 3)
    await queryInterface.bulkInsert('Students', [{
      student_id: '21110000',
      user_id: 3,
      class_name: 'DHCNTT17BTT',
      rfid_tag: 'A1B2C3D4',
      is_card_lost: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Students', null, {});
    await queryInterface.bulkDelete('Teachers', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
