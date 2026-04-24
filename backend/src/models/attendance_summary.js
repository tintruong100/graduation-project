'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const AttendanceSummary = sequelize.define('AttendanceSummary', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        employee_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'Khóa ngoại liên kết nhân viên'
        },
        work_date: {
            type: DataTypes.DATEONLY, // Chỉ lấy ngày (YYYY-MM-DD), bỏ qua giờ phút
            allowNull: false,
            comment: 'Ngày làm việc'
        },
        first_scan_time: {
            type: DataTypes.DATE, // Tương đương TIMESTAMP trong DB
            allowNull: true,
            comment: 'Giờ quét đầu tiên'
        },
        last_scan_time: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Giờ quét cuối cùng'
        },
        late_minutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Tổng số phút đi trễ'
        },
        early_leave_minutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Tổng số phút về sớm trước giờ'
        },
        gross_work_hours: {
            type: DataTypes.DECIMAL(5, 2), // Lưu tối đa 999.99 (VD: 8.50 tiếng)
            defaultValue: 0,
            comment: 'Tổng thời gian có mặt'
        },
        break_hours: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 1.0,
            comment: 'Thời gian nghỉ trưa mặc định'
        },
        net_work_hours: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Giờ làm thực tế được trả lương'
        },
        overtime_hours: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Tổng số giờ TĂNG CA'
        },
        total_scans: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Tổng số lần bấm vân tay trong ngày'
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'PRESENT',
            comment: 'Trạng thái: PRESENT, ABSENT, LATE, MISSING_OUT...'
        },
        is_manually_edited: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Có bị quản lý chỉnh sửa bằng tay không?'
        },
        edit_note: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Ghi chú khi chỉnh sửa tay'
        }
    }, {
        tableName: 'attendance_summary',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            // 1. Đánh Index cho cột work_date để tối ưu tốc độ khi Lọc dữ liệu theo tháng
            {
                fields: ['work_date']
            },
            // 2. Ràng buộc quan trọng: 1 nhân viên chỉ có 1 bản ghi tổng hợp trong 1 ngày
            {
                unique: true,
                fields: ['employee_id', 'work_date']
            }
        ]
    });

    AttendanceSummary.associate = (models) => {
        // Một bản ghi chấm công luôn thuộc về một nhân viên
        AttendanceSummary.belongsTo(models.Employee, {
            foreignKey: 'employee_id',
            as: 'employee'
        });
    };

    return AttendanceSummary;
};