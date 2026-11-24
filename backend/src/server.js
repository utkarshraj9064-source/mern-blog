require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blog';

// Start listening first so Cloud Run's health check passes even while Mongo connects.
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on port ${PORT}`);
});

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const shutdown = () => {
  server.close(() => mongoose.connection.close(false).then(() => process.exit(0)));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
