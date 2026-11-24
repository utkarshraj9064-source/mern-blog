const express = require('express');
const cors = require('cors');
const postsRouter = require('./routes/posts');

const app = express();

// CORS_ORIGIN can be "*" (default) or a comma-separated list of allowed origins
const origins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(cors({ origin: origins.includes('*') ? true : origins }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/posts', postsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
