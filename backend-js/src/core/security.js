const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'mellitus_secreta_segura_jwt_token';

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(plain, hashed) {
  return bcrypt.compareSync(plain, hashed);
}

function createToken(userId) {
  return jwt.sign({ sub: userId }, SECRET_KEY, { expiresIn: '2h' });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY);
}

module.exports = { hashPassword, verifyPassword, createToken, verifyToken };
