const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Posts model
// Example shape:
// {
//   id: '3',
//   author: { foreign key user id },
//   createdAt: new Date(...),
//   teamId: 'T-123',
//   visibility: 'all',
//   content: '',
//   likes: 7,
//   comments: 2,
//   bookmarked: false
// }

const Post = sequelize.define('posts', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	// foreign key to users.id
	author_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'users',
			key: 'id'
		}
	},

	// team identifier (e.g. 'T-123')
	team_id: {
		type: DataTypes.STRING,
		allowNull: true,
	},

	visibility: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'all'
	},

	content: {
		type: DataTypes.TEXT,
		allowNull: true,
	},

	likes: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},

	comments: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},

	bookmarked: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},

	// timestamps (Sequelize will normally manage these when timestamps: true)
	createdAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},

	updatedAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	}
}, {
	freezeTableName: true,
	timestamps: true,
});

module.exports = Post;
