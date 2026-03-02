const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AutomationRule = sequelize.define('AutomationRule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    trigger: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timing: {
        type: DataTypes.STRING,
        defaultValue: 'Immediately'
    },
    timingValue: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    recipient: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Active'
    },
    lastRun: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = AutomationRule;
