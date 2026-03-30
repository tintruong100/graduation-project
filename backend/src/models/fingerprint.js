'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Fingerprint extends Model {
        static associate(models) {
            // 1 Mẫu vân tay thuộc về 1 Nhân viên
            Fingerprint.belongsTo(models.Employee, {
                foreignKey: 'employee_id',
                as: 'employee'
            });
        }
    }

    Fingerprint.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        employee_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id'
            }
        },
        finger_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sensor_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        template_data: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Fingerprint',
        tableName: 'fingerprints',
        timestamps: true,
        underscored: true,
    });

    return Fingerprint;
};