const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const PostLike = sequelize.define('post_likes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['postId', 'userId']
        }
    ]
});

module.exports = PostLike;


