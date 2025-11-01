const {DataTypes} = require('sequelize');
const sequelize = require("../config/db");
const Team = require('./teamModel');

const Post = sequelize.define('posts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    content: {
        type: DataTypes.TEXT
    },

    image: {
        type: DataTypes.STRING
    },

    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    team_id: {
        type: DataTypes.STRING,  // Changed to STRING to accept "T-125" format
        allowNull: true  // null = visible to everyone, set = visible only to team
    }
},
    {
        freezeTableName: true,
    }
);

module.exports = Post;