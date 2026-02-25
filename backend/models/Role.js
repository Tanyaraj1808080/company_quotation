const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    permissions: {
        type: DataTypes.JSON, // Storing as JSON for flexibility
        defaultValue: [],
        get() {
            const rawValue = this.getDataValue('permissions');
            if (!rawValue) return [];
            return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
        }
    }
}, {
    timestamps: true
});

module.exports = Role;
