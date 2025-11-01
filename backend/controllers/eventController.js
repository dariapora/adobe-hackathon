const Event = require('../models/index').Event;

const Controller = {
    createEvent: async (req, res) => {
        try {
            const { date, description, title, team_id } = req.body;
            if (!team_id) {
                return res.status(400).json({ error: 'team_id is required' });
            }
            const newEvent = await Event.create({ date, description, title, team_id });
            res.status(201).json(newEvent);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllEvents: async (req, res) => {
        try {
            const { team_id } = req.query;
            const where = team_id ? { team_id } : {};
            const events = await Event.findAll({ where, order: [['date', 'ASC']] });
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = Controller;