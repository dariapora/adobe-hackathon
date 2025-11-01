const sequelize = require('../config/db');
const User = require('./userModel');
const Team = require("./teamModel")

User.belongsTo(Team, { 
    foreignKey: 'team_id',
    as: 'team'
});

Team.hasOne(User, {
    foreignKey: 'team_id',
    as: 'user'
});

module.exports = {
    sequelize,
    User,
    Team,
};
