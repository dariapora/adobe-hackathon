const {DataTypes} = require('sequelize');
const sequelize = require("../config/db");

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

    visibility: {
        // Team ID string or null (null means visible to everyone)
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
},
    {
        timestamps: true,
    }
);

module.exports = Post;