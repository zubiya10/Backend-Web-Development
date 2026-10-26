
const COOKIE_NAME = 'sid';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  signed: true,
  path: '/',
  maxAge: Number(process.env.SESSION_TTL_MS || 3600000),
};

const clearCookieOptions = {
  httpOnly: cookieOptions.httpOnly,
  secure: cookieOptions.secure,
  sameSite: cookieOptions.sameSite,
  signed: true,
  path: cookieOptions.path,
};

module.exports = {
  COOKIE_NAME,
  cookieOptions,
  clearCookieOptions,
};
