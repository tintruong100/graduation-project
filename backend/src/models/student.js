'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsTo(models.User, { foreignKey: 'user_id' });
      Student.belongsToMany(models.CourseClass, { through: models.Enrollment, foreignKey: 'student_id' });
      Student.hasMany(models.AttendanceRecord, { foreignKey: 'student_id' });
      Student.hasMany(models.Complaint, { foreignKey: 'student_id' });
    }
  }
  Student.init({
    student_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    user_id: DataTypes.INTEGER,
    class_name: DataTypes.STRING,
    rfid_tag: {
      type: DataTypes.STRING,
      unique: true
    },
    face_encoding: DataTypes.ARRAY(DataTypes.FLOAT),
    face_image_url: DataTypes.STRING,
    is_card_lost: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Student',
  });
  return Student;
};
