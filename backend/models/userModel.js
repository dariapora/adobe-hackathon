const {DataTypes} = require('sequelize')
const sequelize = require('../config/db');
const Team = require('./teamModel');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    google_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },

    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,  // Will be set during onboarding
    },

    profile_picture: {
        type: DataTypes.STRING,
    },

    hd_domain: {
        type: DataTypes.STRING,
    },

    role: {
        type: DataTypes.STRING,  
    },

    team_id: {
        type: DataTypes.STRING,  // Changed to STRING to accept "T-125" format
        allowNull: true  // Will be set during onboarding
    }
},
    {
        freezeTableName: true,
    }
);

module.exports = User;