'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('security_alerts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      alert_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'INTRUDER_DETECTED'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      device_id: {
        type: Sequelize.STRING(50),
        defaultValue: 'PI_MAIN_OFFICE'
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'UNREAD'
      },
      resolved_at: {
        type: Sequelize.DATE,
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

    // Thêm các Index để tối ưu truy vấn
    await queryInterface.addIndex('security_alerts', ['created_at']);
    await queryInterface.addIndex('security_alerts', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('security_alerts');
  }
};