'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('departments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      manager_id: {
        type: Sequelize.UUID,
        allowNull: true
        // Lưu ý: Chưa tạo references ở đây để tránh lỗi vòng lặp
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: '08:00:00'
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: '17:00:00'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('departments');
  }
};