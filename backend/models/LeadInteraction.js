const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const LeadInteraction = sequelize.define('LeadInteraction', {
    leadId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    summary: {
        type: DataTypes.TEXT
    },
    followupDate: {
        type: DataTypes.DATEONLY
    },
    status: {
        type: DataTypes.STRING
    },
    dealValue: {
        type: DataTypes.DECIMAL(10, 2)
    },
    meetingDate: {
        type: DataTypes.DATEONLY
    }
});

module.exports = LeadInteraction;
