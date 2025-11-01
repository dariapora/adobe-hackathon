const { Sequelize } = require('sequelize');
const User = require('../models/userModel');
const Post = require('../models/postModel');

const Controller = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll();
            res.status(200).json(users);
        }catch(err) {
            res.status(500).json({error: err.message});
        }
    },

    getUserById: async (req, res) => {
        try {
            const id = req.params.id;
            const user = await User.findByPk(id);

            if(!user)
                return res.status(404).json({error: "Invalid Id"});

            res.status(200).json(user);
        } catch(err) {
            res.status(500).json({error: err.message});
        }
    },

    getUsersByTeamId: async (req, res) => {
        try {
            const teamID = req.params.id;
            if (!teamID){
                return res.status(404).send("Echipa nu exista");
            }
            const users = await User.findAll({
                where:{
                    team_id: teamID,
                }
            })
            if (users.length === 0){
                return res.status(404).send("Nu exista useri in echipa respectiva");
            }
            return res.status(200).json(users);
        } catch(err) {
            console.log(`Eroare ${err}`);
            return res.status(500).send("Eroare la server");

        }
    }
,

    // GET /api/user/leaderboard/month
    getMonthlyLeaderboard: async (req, res) => {
        try {
            const XP_PER_POST = 10;
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            // Count posts per user within current month
            const { Op } = require('sequelize');
            const counts = await Post.findAll({
                attributes: [
                    'user_id',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'postCount']
                ],
                where: {
                    createdAt: { [Op.between]: [startOfMonth, endOfMonth] }
                },
                group: ['user_id']
            });

            const userIds = counts.map(c => c.user_id);
            const users = await User.findAll({
                where: { id: userIds },
                attributes: ['id', 'first_name', 'last_name', 'username', 'profile_picture', 'experience']
            });

            const idToUser = new Map(users.map(u => [u.id, u]));
            const leaderboard = counts.map(c => {
                const postCount = parseInt(c.get('postCount'), 10);
                const user = idToUser.get(c.user_id);
                return {
                    user: user,
                    monthlyPosts: postCount,
                    monthlyXp: postCount * XP_PER_POST
                };
            }).sort((a, b) => b.monthlyXp - a.monthlyXp);

            res.json(leaderboard);
        } catch (err) {
            console.error('Error building monthly leaderboard:', err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = Controller;