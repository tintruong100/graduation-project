'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Complaint extends Model {
    static associate(models) {
      Complaint.belongsTo(models.Student, { foreignKey: 'student_id' });
      Complaint.belongsTo(models.Schedule, { foreignKey: 'schedule_id' });
      Complaint.belongsTo(models.Teacher, { foreignKey: 'resolved_by' });
    }
  }
  Complaint.init({
    complaint_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: DataTypes.STRING,
    schedule_id: DataTypes.INTEGER,
    reason: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    resolved_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Complaint',
    createdAt: 'created_at',
    updatedAt: 'updatedAt'
  });
  return Complaint;
};
