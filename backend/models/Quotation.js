const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Quotation = sequelize.define('Quotation', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    clientName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalValue: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD'
    },
    dateCreated: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    items: {
        type: DataTypes.JSON // MySQL 5.7+ support
    }
});

module.exports = Quotation;
