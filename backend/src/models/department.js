'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Department extends Model {
        static associate(models) {
            // 1 Phòng ban có 1 Trưởng phòng (Liên kết tới bảng employees qua manager_id)
            Department.belongsTo(models.Employee, {
                foreignKey: 'manager_id',
                as: 'manager'
            });

            // 1 Phòng ban có Nhiều nhân viên (Liên kết tới bảng employees qua department_id)
            Department.hasMany(models.Employee, {
                foreignKey: 'department_id',
                as: 'employees'
            });
        }
    }

    Department.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        manager_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'employees',
                key: 'id'
            }
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: '08:00:00'
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: '17:00:00'
        }
    }, {
        sequelize,
        modelName: 'Department',
        tableName: 'departments',
        timestamps: true,
        underscored: true,
    });

    return Department;
};