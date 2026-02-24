const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Lead = sequelize.define('Lead', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'New'
    }
});

module.exports = Lead;
