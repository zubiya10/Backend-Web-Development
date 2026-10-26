
const { randomUUID } = require('node:crypto');

const sessions = new Map();

const SESSION_TTL_MS = Number(
  process.env.SESSION_TTL_MS || 3600000
);

function create(userId) {
  const id = randomUUID();

  const session = {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  sessions.set(id, session);

  return id;
}

function get(id) {
  if (typeof id !== 'string') {
    return null;
  }

  const session = sessions.get(id);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return null;
  }

  return session;
}

function destroy(id) {
  if (typeof id === 'string') {
    sessions.delete(id);
  }
}

module.exports = {
  create,
  get,
  destroy,
};
