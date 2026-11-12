require('dotenv').config({ quiet: true });
const mysql = require('mysql2');
const config = { host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'student', password: process.env.DB_PASSWORD, database: process.env.DB_NAME || 'lab22_477', connectTimeout: 3000, multipleStatements: false };
function createPool() {
  const pool = mysql.createPool({ ...config, connectionLimit: 10 });
  pool.on('error', error => console.error('[POOL ERROR]', error.code));
  return pool;
}
const schema = 'CREATE TABLE IF NOT EXISTS students (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL, group_name VARCHAR(20) NOT NULL, course INT NOT NULL, grade DECIMAL(3,2), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';
module.exports = { mysql, config, createPool, schema };
