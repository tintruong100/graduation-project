'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột custom_start_time
    await queryInterface.addColumn('employees', 'custom_start_time', {
      type: Sequelize.TIME,
      allowNull: true,
      comment: 'Giờ vào làm riêng. Nếu NULL thì lấy theo Phòng ban'
    });

    // Thêm cột custom_end_time
    await queryInterface.addColumn('employees', 'custom_end_time', {
      type: Sequelize.TIME,
      allowNull: true,
      comment: 'Giờ ra về riêng. Nếu NULL thì lấy theo Phòng ban'
    });
  },

  async down(queryInterface, Sequelize) {
    // Xóa cột nếu bạn muốn rollback (quay xe)
    await queryInterface.removeColumn('employees', 'custom_start_time');
    await queryInterface.removeColumn('employees', 'custom_end_time');
  }
};