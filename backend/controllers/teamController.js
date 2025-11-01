const Team = require('../models/teamModel')

const Controller = {
    createTeam: async (req, res) => {
        try {
            const { department } = req.body
            const newTeam = await Team.create({ department })
            res.status(201).json(newTeam)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    getAllTeams: async (req, res) => {
        try {
            const teams = await Team.findAll({
                order: [['department', 'ASC']]
            })
            res.status(200).json(teams)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = Controller
