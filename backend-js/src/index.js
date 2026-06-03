require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const prisma         = require('./database');
const authRoutes     = require('./routes/auth');
const patientRoutes  = require('./routes/patients');
const authMiddleware = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>
  res.json({ message: 'A API do Mellitus.IA está no ar e protegida!' })
);

app.use('/auth',     authRoutes);
app.use('/patients', authMiddleware, patientRoutes);

async function start() {
  await prisma.$connect();
  console.log('Banco de dados conectado!');
  app.listen(PORT, () =>
    console.log(`Servidor rodando em http://localhost:${PORT}`)
  );
}

start().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
