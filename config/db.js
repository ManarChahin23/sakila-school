const mysql = require('mysql2'); 
const database = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'sakila',
  port: Number(process.env.DB_PORT) || 3306, 
  waitForConnections: true,
  connectionLimit: 10,
});
module.exports = database; 
