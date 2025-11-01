const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/userModel');
const router = require('./routes/index');

const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", router);

// Routes
app.use('/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Adobe Hackathon API' });
});

const PORT = process.env.PORT || 8090;

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
    console.log('📊 Database synced');
    app.listen(PORT, () => {
        console.log(`Aplicatia ruleaza pe port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});