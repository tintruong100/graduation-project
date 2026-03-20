'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    static associate(models) {
      // define association here
    }
  }
  Enrollment.init({
    course_class_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'Enrollment',
  });
  return Enrollment;
};
