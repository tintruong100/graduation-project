'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CourseClass extends Model {
    static associate(models) {
      CourseClass.belongsTo(models.Subject, { foreignKey: 'subject_id' });
      CourseClass.belongsTo(models.Teacher, { foreignKey: 'teacher_id' });
      CourseClass.belongsToMany(models.Student, { through: models.Enrollment, foreignKey: 'course_class_id' });
      CourseClass.hasMany(models.Schedule, { foreignKey: 'course_class_id' });
    }
  }
  CourseClass.init({
    course_class_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    course_code: DataTypes.STRING,
    subject_id: DataTypes.STRING,
    teacher_id: DataTypes.STRING,
    semester: DataTypes.STRING,
    year: DataTypes.STRING,
    total_sessions: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CourseClass',
  });
  return CourseClass;
};
