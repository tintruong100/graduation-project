'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. TẠO BẢNG
    await queryInterface.createTable('attendance_summary', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      employee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'employees', // Tên bảng nhân viên trong Database (phải viết đúng chữ thường, số nhiều)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Xóa nhân viên thì log chấm công cũng bay theo (hoặc bạn có thể đổi thành 'SET NULL' tùy nghiệp vụ)
      },
      work_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      first_scan_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_scan_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      late_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      early_leave_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      gross_work_hours: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      break_hours: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 1.0
      },
      net_work_hours: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      overtime_hours: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      total_scans: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'PRESENT'
      },
      is_manually_edited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_note: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 2. ĐÁNH INDEX DỮ LIỆU ĐỂ TRUY VẤN SIÊU NHANH
    await queryInterface.addIndex('attendance_summary', ['work_date'], {
      name: 'idx_attendance_summary_work_date'
    });

    // 3. ĐÁNH RÀNG BUỘC UNIQUE (1 nhân viên chỉ có 1 dòng summary mỗi ngày)
    await queryInterface.addIndex('attendance_summary', ['employee_id', 'work_date'], {
      unique: true,
      name: 'unique_employee_work_date'
    });
  },

  async down(queryInterface, Sequelize) {
    // Xóa bảng nếu cần Rollback
    await queryInterface.dropTable('attendance_summary');
  }
};