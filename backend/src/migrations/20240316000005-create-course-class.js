'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CourseClasses', {
      course_class_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      course_code: {
        type: Sequelize.STRING
      },
      subject_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Subjects',
          key: 'subject_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      teacher_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Teachers',
          key: 'teacher_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      semester: {
        type: Sequelize.STRING
      },
      year: {
        type: Sequelize.STRING
      },
      total_sessions: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CourseClasses');
  }
};
