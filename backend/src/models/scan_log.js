'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ScanLog extends Model {
        static associate(models) {
            // 1 Lịch sử quét thuộc về 1 Nhân viên (Có thể NULL nếu người lạ quét)
            ScanLog.belongsTo(models.Employee, {
                foreignKey: 'employee_id',
                as: 'employee'
            });
        }
    }

    ScanLog.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        employee_id: {
            type: DataTypes.UUID,
            allowNull: true, // Cho phép NULL để ghi nhận sai vân tay
            references: {
                model: 'employees',
                key: 'id'
            }
        },
        scan_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        image_path: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'SUCCESS',
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'ScanLog',
        tableName: 'scan_logs',
        timestamps: true,
        underscored: true,
    });

    return ScanLog;
};