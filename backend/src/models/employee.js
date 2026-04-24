'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Employee extends Model {
        static associate(models) {
            // 1 Nhân viên thuộc về 1 Phòng ban
            Employee.belongsTo(models.Department, {
                foreignKey: 'department_id',
                as: 'department'
            });

            // 1 Nhân viên có thể làm quản lý 1 Phòng ban
            Employee.hasOne(models.Department, {
                foreignKey: 'manager_id',
                as: 'managed_department'
            });

            // 1 Nhân viên có nhiều mẫu vân tay
            Employee.hasMany(models.Fingerprint, {
                foreignKey: 'employee_id',
                as: 'fingerprints'
            });

            // 1 Nhân viên có nhiều lịch sử quét
            Employee.hasMany(models.ScanLog, {
                foreignKey: 'employee_id',
                as: 'scan_logs'
            });
        }
    }

    Employee.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        employee_code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        gender: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        avatar_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        department_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'departments',
                key: 'id'
            }
        },
        position: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM('ADMIN', 'MANAGER', 'EMPLOYEE'),
            defaultValue: 'EMPLOYEE',
            allowNull: false
        },
        custom_start_time: {
            type: DataTypes.TIME,
            allowNull: true, // Cho phép NULL vì đa số sẽ dùng giờ phòng ban
            comment: 'Giờ vào làm riêng. Nếu NULL thì lấy theo Phòng ban'
        },
        custom_end_time: {
            type: DataTypes.TIME,
            allowNull: true,
            comment: 'Giờ ra về riêng. Nếu NULL thì lấy theo Phòng ban'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Employee',
        tableName: 'employees',
        timestamps: true,
        underscored: true,
    });

    return Employee;
};