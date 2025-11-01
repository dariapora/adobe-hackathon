const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await User.findOne({ where: { google_id: profile.id } });
                
                if (!user) {
                    // Create new user (role and team_id will be set during onboarding)
                    user = await User.create({
                        google_id: profile.id,
                        email: profile.emails[0].value,
                        email_verified: profile.emails[0].verified || false,
                        name: profile.displayName,
                        profile_picture: profile.photos[0]?.value || null,
                        hd_domain: profile._json.hd || null,
                        role: null,
                        team_id: null
                    });
                }
                
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
