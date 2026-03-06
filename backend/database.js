const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3307,
        dialect: 'mysql',
        //logging: console.log, // Enable SQL logging to terminal
    }
);

module.exports = sequelize;
