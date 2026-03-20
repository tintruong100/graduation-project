'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {
      Schedule.belongsTo(models.CourseClass, { foreignKey: 'course_class_id' });
      Schedule.belongsTo(models.Device, { foreignKey: 'device_id' });
      Schedule.hasMany(models.AttendanceRecord, { foreignKey: 'schedule_id' });
      Schedule.hasMany(models.Complaint, { foreignKey: 'schedule_id' });
    }
  }
  Schedule.init({
    schedule_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    course_class_id: DataTypes.INTEGER,
    room_name: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    start_time: DataTypes.TIME,
    end_time: DataTypes.TIME,
    device_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Schedule',
  });
  return Schedule;
};
