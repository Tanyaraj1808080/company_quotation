const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Opportunity = sequelize.define('Opportunity', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    client: {
        type: DataTypes.STRING
    },
    stage: {
        type: DataTypes.STRING,
        defaultValue: 'Discovery'
    },
    value: {
        type: DataTypes.FLOAT
    },
    closeDate: {
        type: DataTypes.DATEONLY
    }
});

module.exports = Opportunity;
