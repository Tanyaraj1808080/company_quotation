const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const CompanySetting = sequelize.define('CompanySetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    companyName: {
        type: DataTypes.STRING,
        defaultValue: 'Mindmanthan Software Solutions'
    },
    companyAddress: {
        type: DataTypes.TEXT,
        defaultValue: 'A90, A BLOCK, SECTOR 4, NOIDA, UTTAR PRADESH 201301'
    },
    companyLogo: {
        type: DataTypes.TEXT('long'), // Base64 or URL
        allowNull: true
    }
});

module.exports = CompanySetting;
