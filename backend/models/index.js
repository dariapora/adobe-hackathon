const sequelize = require('../config/db');
const User = require('./userModel');
const Team = require("./teamModel");
const Post = require("./postModel");

// User <-> Post relationships
User.hasMany(Post, {
    foreignKey: {
        name: 'user_id',
        allowNull: false
    },
    as: 'posts',
    constraints: false
});

Post.belongsTo(User, {
    foreignKey: {
        name: 'user_id',
        allowNull: false
    },
    as: 'author',
    constraints: false
});

// Note: team_id is just a string identifier, not a foreign key to teams table
// Users and Posts just store team_id as a string (e.g., "T-125", "Engineering")

module.exports = {
    sequelize,
    User,
    Team,
    Post
};
