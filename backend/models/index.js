const sequelize = require('../config/db');
const User = require('./userModel');
const Team = require("./teamModel");
const Post = require("./postModel");
const PostLike = require("./postLikeModel");
const Event = require("./eventModel");
const Conversation = require('./conversationModel');
const Message = require('./messageModel');
const Comment = require('./commentModel');

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

// Conversation relationships (1-1 only)
Conversation.belongsTo(User, {
    foreignKey: 'user1Id',
    as: 'user1'
});

Conversation.belongsTo(User, {
    foreignKey: 'user2Id',
    as: 'user2'
});

// Message relationships
Conversation.hasMany(Message, {
    foreignKey: 'conversationId',
    as: 'messages',
    onDelete: 'CASCADE'
});

Message.belongsTo(Conversation, {
    foreignKey: 'conversationId',
    as: 'conversation'
});

User.hasMany(Message, {
    foreignKey: 'senderId',
    as: 'sentMessages'
});

Message.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'sender'
});

// Comments relationships
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'userComments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// Post likes relationships
Post.hasMany(PostLike, { foreignKey: 'postId', as: 'likesList', onDelete: 'CASCADE' });
PostLike.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(PostLike, { foreignKey: 'userId', as: 'postLikes', onDelete: 'CASCADE' });
PostLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Note: team_id is just a string identifier, not a foreign key to teams table
// Users and Posts just store team_id as a string (e.g., "T-125", "Engineering")

module.exports = {
    sequelize,
    User,
    Team,
    Post,
    Comment,
    PostLike,
    Event,
    Conversation,
    Message
};
