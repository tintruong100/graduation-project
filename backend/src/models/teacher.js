'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    static associate(models) {
      Teacher.belongsTo(models.User, { foreignKey: 'user_id' });
      Teacher.hasMany(models.CourseClass, { foreignKey: 'teacher_id' });
      Teacher.hasMany(models.Complaint, { foreignKey: 'resolved_by' });
    }
  }
  Teacher.init({
    teacher_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    user_id: DataTypes.INTEGER,
    department_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Teacher',
  });
  return Teacher;
};
