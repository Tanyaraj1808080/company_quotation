const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Followup = sequelize.define('Followup', {
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    client: {
        type: DataTypes.STRING
    },
    dueDate: {
        type: DataTypes.DATEONLY
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    }
});

module.exports = Followup;
