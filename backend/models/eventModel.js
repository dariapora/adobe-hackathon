const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('events', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    freezeTableName: true,
}
);

module.exports = Event;