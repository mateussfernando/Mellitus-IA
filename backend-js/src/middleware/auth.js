const { verifyToken } = require('../core/security');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Token não fornecido.' });
  }

  try {
    const payload = verifyToken(header.split(' ')[1]);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ detail: 'Credenciais inválidas ou token expirado.' });
  }
}

module.exports = authMiddleware;
