'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      Device.hasMany(models.Schedule, { foreignKey: 'device_id' });
    }
  }
  Device.init({
    device_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    device_name: DataTypes.STRING,
    ip_address: DataTypes.STRING,
    location: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};
