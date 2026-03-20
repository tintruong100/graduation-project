'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AttendanceRecord extends Model {
    static associate(models) {
      AttendanceRecord.belongsTo(models.Schedule, { foreignKey: 'schedule_id' });
      AttendanceRecord.belongsTo(models.Student, { foreignKey: 'student_id' });
    }
  }
  AttendanceRecord.init({
    record_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    schedule_id: DataTypes.INTEGER,
    student_id: DataTypes.STRING,
    check_in_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_rfid_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_face_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: DataTypes.STRING,
    image_capture_url: DataTypes.STRING,
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AttendanceRecord',
  });
  return AttendanceRecord;
};
