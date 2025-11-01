const Team = require('../models/teamModel')

const Controller = {
    createTeam: async (req, res) => {
        try {
            const { department } = req.body
            const newTeam = await Team.create({ department })
            res.status(201).json(newTeam)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }
}

module.exports = Controller
