const router  = require('express').Router();
const prisma  = require('../database');
const { hashPassword, verifyPassword, createToken } = require('../core/security');

router.post('/register', async (req, res) => {
  const { name, email, password, crm } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ detail: 'E-mail já está em uso.' });

    const user = await prisma.user.create({
      data: { name, email, password: hashPassword(password), crm },
    });
    res.json({ message: 'Médico/Usuário cadastrado com sucesso', id: user.id });
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
});

router.post('/login', async (req, res) => {
  // aceita tanto { email, password } quanto { username, password } (compat form)
  const email    = req.body.email || req.body.username;
  const password = req.body.password;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.is_active)
      return res.status(400).json({ detail: 'Usuário incorreto ou inativo.' });
    if (!verifyPassword(password, user.password))
      return res.status(400).json({ detail: 'Senha incorreta.' });

    res.json({ access_token: createToken(user.id), token_type: 'bearer' });
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
});

module.exports = router;
