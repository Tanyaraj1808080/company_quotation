const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Task = sequelize.define('Task', {
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    relatedType: {
        type: DataTypes.STRING, // Client, Lead, Opportunity, Quotation, Follow-up, Meeting
        allowNull: true
    },
    relatedId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assignedTo: {
        type: DataTypes.STRING
    },
    dueAt: {
        type: DataTypes.DATE, // Stores Date + Time
        allowNull: true
    },
    reminderAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    priority: {
        type: DataTypes.STRING,
        defaultValue: 'Medium'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    attachments: {
        type: DataTypes.JSON, // Stores array of metadata/filenames
        defaultValue: []
    }
}, {
    timestamps: true
});

module.exports = Task;
