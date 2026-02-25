const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Lead = sequelize.define('Lead', {
    clientName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company: {
        type: DataTypes.STRING
    },
    roleProjectType: {
        type: DataTypes.STRING
    },
    contactLink: {
        type: DataTypes.STRING
    },
    dateToConnect: {
        type: DataTypes.DATEONLY
    },
    followupDate: {
        type: DataTypes.DATEONLY
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'New'
    },
    meetingDate: {
        type: DataTypes.DATEONLY
    },
    dealValue: {
        type: DataTypes.DECIMAL(10, 2)
    },
    notes: {
        type: DataTypes.TEXT
    },
    customFields: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
});

module.exports = Lead;
