const { Sequelize } = require('sequelize');

// Neon database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Required for Neon
        }
    },
    logging: false // Set to console.log to see SQL queries
});

// Test the connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

testConnection();

module.exports = sequelize;