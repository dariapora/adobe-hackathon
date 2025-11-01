const { Sequelize } = require('sequelize');
const User = require('../models/userModel');

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
}

module.exports = Controller;