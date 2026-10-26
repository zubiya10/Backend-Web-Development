
const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');

module.exports = async function requireSession(req, res, next) {
  try {
    const sessionId = req.signedCookies?.sid;

    if (typeof sessionId !== 'string' || !sessionId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      });
    }

    const session = sessionStore.get(sessionId);

    if (!session) {
      return res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      });
    }

    const user = await userRepository.findPublicById(
      session.userId
    );

    if (!user) {
      sessionStore.destroy(sessionId);

      return res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
