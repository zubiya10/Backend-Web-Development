
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const COST_FACTOR = 10;

// A valid bcrypt hash used to keep unknown-email login
// attempts doing comparable password-checking work.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  'dummy-password-for-timing-only',
  COST_FACTOR
);

class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function validateString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function register({ name, email, password }) {
  if (
    !validateString(name) ||
    !validateString(email) ||
    !validateString(password)
  ) {
    throw new AppError(
      400,
      'INVALID_INPUT',
      'Name, email, and password are required'
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();

  const passwordHash = await bcrypt.hash(password, COST_FACTOR);

  try {
    const user = await userRepository.createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
    });

    return safeUser(user);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError(
        409,
        'EMAIL_EXISTS',
        'An account with this email already exists'
      );
    }

    throw error;
  }
}

async function login({ email, password }) {
  if (!validateString(email) || !validateString(password)) {
    throw new AppError(
      400,
      'INVALID_INPUT',
      'Email and password are required'
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);

    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  return safeUser(user);
}

module.exports = {
  register,
  login,
  AppError,
};
