const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Task = sequelize.define('Task', {
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    relatedTo: {
        type: DataTypes.STRING
    },
    assignedTo: {
        type: DataTypes.STRING
    },
    dueDate: {
        type: DataTypes.DATEONLY
    },
    priority: {
        type: DataTypes.STRING,
        defaultValue: 'Normal'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    }
});

module.exports = Task;
