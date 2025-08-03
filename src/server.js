// src/server.js
const app = require('./app');
const sequelize = require('./config/db');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to the database');

    // Auto-sync all models to DB
    try {
      await sequelize.sync({ alter: true }); // Use force: true for development
      console.log('✅ Database tables synced successfully');
    } catch (syncError) {
      console.error('❌ Database sync failed:', syncError.message);
      console.log('🔄 Trying to sync without force...');
      await sequelize.sync({ alter: false }); // Try without altering
      console.log('✅ Database tables synced (existing structure)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // exit on DB failure
  }
})();


