const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dataSource: {
        type: DataTypes.STRING
    },
    reportType: {
        type: DataTypes.STRING
    },
    fields: {
        type: DataTypes.JSON
    },
    lastGenerated: {
        type: DataTypes.DATEONLY
    },
    filters: {
        type: DataTypes.TEXT
    }
});

module.exports = Report;
