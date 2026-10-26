
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

if (!process.env.COOKIE_SECRET) {
  throw new Error('COOKIE_SECRET is required');
}

const app = express();

// Parse JSON request bodies before handling routes.
app.use(express.json());

// Parse signed cookies using the secret from .env.
app.use(cookieParser(process.env.COOKIE_SECRET));

// Authentication endpoints.
app.use('/auth', authRoutes);

// Handle invalid JSON request bodies.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Request body must contain valid JSON',
      },
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
