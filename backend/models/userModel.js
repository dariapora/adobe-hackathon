const {DataTypes} = require('sequelize')
const sequelize = require('../config/db');

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

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    profile_picture: {
        type: DataTypes.STRING,
    },

    hd_domain: {
        type: DataTypes.STRING,    //nu stim daca allow null sau nu
    },

    role: {
        type: DataTypes.STRING,  //nici la asta nu stim
    },

    team_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,    
    }
},
    {
        freezeTableName: true,
    }
);

module.exports = User;