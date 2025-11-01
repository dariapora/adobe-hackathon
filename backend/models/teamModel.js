const {DataTypes} = require('sequelize');
const sequelize = require("../config/db");

const Team = sequelize.define('teams', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    department: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    }
},
    {
        freezeTableName: true,
    }
);

module.exports = Team;