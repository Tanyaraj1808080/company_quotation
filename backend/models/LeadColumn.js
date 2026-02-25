const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const LeadColumn = sequelize.define('LeadColumn', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'text'
    }
});

module.exports = LeadColumn;
