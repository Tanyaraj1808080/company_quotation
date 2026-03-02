const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const QuotationTemplate = sequelize.define('QuotationTemplate', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    }
});

module.exports = QuotationTemplate;
