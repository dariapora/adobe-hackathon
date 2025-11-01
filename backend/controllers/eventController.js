const Event = require('../models/index').Event;

const Controller = {
    createEvent: async (req, res) => {
        try {
            const { date, description, title } = req.body;
            const newEvent = await Event.create({ date, description, title });
            res.status(201).json(newEvent);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllEvents: async (req, res) => {
        try {
            const events = await Event.findAll();
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = Controller;