require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
    "port": process.env.DB_PORT || 10272, // Đảm bảo dùng đúng port 10272 của Aiven
    "logging": false,
    "query": {
      "raw": true
    },
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": true, // Bật kiểm tra chứng chỉ nghiêm ngặt
        "ca": process.env.DB_SSL_CA   // Nạp chứng chỉ từ biến môi trường
      }
    }
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
    "port": process.env.DB_PORT || 10272, // Cập nhật port cho production
    "logging": false,
    "query": {
      "raw": true
    },
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": true,
        "ca": process.env.DB_SSL_CA
      }
    }
  }
};