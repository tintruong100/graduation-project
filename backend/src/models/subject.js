'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    static associate(models) {
      Subject.hasMany(models.CourseClass, { foreignKey: 'subject_id' });
    }
  }
  Subject.init({
    subject_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    subject_name: DataTypes.STRING,
    credits: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Subject',
  });
  return Subject;
};
