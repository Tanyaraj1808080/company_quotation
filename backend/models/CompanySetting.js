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
    },
    primaryColor: {
        type: DataTypes.STRING,
        defaultValue: '#0d6efd'
    },
    secondaryColor: {
        type: DataTypes.STRING,
        defaultValue: '#6c757d'
    },
    // General Settings
    timezone: {
        type: DataTypes.STRING,
        defaultValue: 'IST'
    },
    currencySymbol: {
        type: DataTypes.STRING,
        defaultValue: 'INR'
    },
    dateFormat: {
        type: DataTypes.STRING,
        defaultValue: 'DD/MM/YYYY'
    },
    timeFormat: {
        type: DataTypes.STRING,
        defaultValue: '12-hour'
    },
    weekStartsOn: {
        type: DataTypes.STRING,
        defaultValue: 'Monday'
    },
    currencyPosition: {
        type: DataTypes.STRING,
        defaultValue: 'Before Amount'
    },
    decimalPlaces: {
        type: DataTypes.INTEGER,
        defaultValue: 2
    },
    thousandSeparatorStyle: {
        type: DataTypes.STRING,
        defaultValue: 'International'
    },
    defaultReminderTime: {
        type: DataTypes.STRING,
        defaultValue: '30 minutes'
    }
});

module.exports = CompanySetting;
