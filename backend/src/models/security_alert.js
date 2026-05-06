'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const SecurityAlert = sequelize.define('SecurityAlert', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        alert_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'INTRUDER_DETECTED',
            comment: 'Loại cảnh báo: INTRUDER_DETECTED, SYSTEM_ERROR, v.v.'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Nội dung chi tiết của cảnh báo'
        },
        device_id: {
            type: DataTypes.STRING(50),
            defaultValue: 'PI_MAIN_OFFICE',
            comment: 'ID của thiết bị Raspberry Pi gửi cảnh báo'
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'UNREAD',
            comment: 'Trạng thái xử lý: UNREAD, ACKNOWLEDGED, RESOLVED'
        },
        resolved_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Thời điểm quản trị viên đã xử lý cảnh báo'
        },
        // Lưu ý: createdAt chính là thời điểm xảy ra cảnh báo (timestamp từ Pi gửi về)
    }, {
        tableName: 'security_alerts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            // Đánh Index cho created_at để truy vấn danh sách cảnh báo mới nhất nhanh hơn
            {
                fields: ['created_at']
            },
            // Index cho status để Admin lọc các cảnh báo chưa đọc
            {
                fields: ['status']
            }
        ]
    });

    SecurityAlert.associate = (models) => {
        // Nếu sau này bạn muốn liên kết cảnh báo với một khu vực hoặc phòng ban cụ thể
        // SecurityAlert.belongsTo(models.OfficeZone, { foreignKey: 'zone_id' });
    };

    return SecurityAlert;
};