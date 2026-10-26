
const express = require('express');
const bcrypt = require('bcryptjs');

const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');

const {
  COOKIE_NAME,
  cookieOptions,
  clearCookieOptions,
} = require('../config/cookieConfig');

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    const password =
      typeof req.body?.password === 'string'
        ? req.body.password
        : '';

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Email and password are required',
        },
      });
    }

    const user = await userRepository.findByEmail(email);

    // Use the same error response for an unknown email
    // and an incorrect password.
    const dummyHash =
      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

    const passwordMatches = await bcrypt.compare(
      password,
      user ? user.passwordHash : dummyHash
    );

    if (!user || !passwordMatches) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Create a server-side session for the authenticated user.
    const sessionId = sessionStore.create(user.id);

    // Send the session identifier in a signed, HTTP-only cookie.
    res.cookie(COOKIE_NAME, sessionId, cookieOptions);

    return res.status(200).json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({
    data: {
      user: req.user,
    },
  });
});

// POST /auth/logout
router.post('/logout', (req, res, next) => {
  try {
    const sessionId = req.signedCookies?.[COOKIE_NAME];

    if (typeof sessionId === 'string') {
      sessionStore.destroy(sessionId);
    }

    res.clearCookie(COOKIE_NAME, clearCookieOptions);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
