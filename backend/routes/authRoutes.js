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
        // Check if user needs to complete profile
        const needsOnboarding = !req.user.role || !req.user.team_id;
        
        if (needsOnboarding) {
            res.redirect(`${process.env.FRONTEND_URL}/onboarding`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/`);
        }
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

router.post('/complete-profile', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
        const { role, teamId } = req.body;
        
        if (!role || !teamId) {
            return res.status(400).json({ message: 'Role and Team ID are required' });
        }
        
        await req.user.update({ 
            role: role,
            team_id: teamId 
        });
        
        res.json({ success: true, user: req.user });
    } catch (error) {
        console.error('Error completing profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

module.exports = router;
