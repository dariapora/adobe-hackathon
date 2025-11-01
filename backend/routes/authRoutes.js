const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);


router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/home`);
    }
);

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.redirect(process.env.FRONTEND_URL);
    });
});

router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router;
