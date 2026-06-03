const router = require('express').Router();
const prisma = require('../database');
const { preverRiscoDiabetes } = require('../core/modelLoader');

router.post('/', async (req, res) => {
  const {
    name, cpf, birth_date,
    glicemia, pressao, imc, idade,
    gestacoes, espessura_pele, insulina, historico_familiar,
  } = req.body;

  try {
    const { probabilidade, risco } = await preverRiscoDiabetes({
      glicemia, pressao, imc, idade,
      gestacoes, espessura_pele, insulina, historico_familiar,
    });

    const patient = await prisma.patient.create({
      data: {
        name,
        cpf,
        birth_date:             new Date(birth_date),
        glicemia,
        pressao,
        imc,
        idade,
        gestacoes:              gestacoes          ?? null,
        espessura_pele:         espessura_pele     ?? null,
        insulina:               insulina           ?? null,
        historico_familiar:     historico_familiar ?? null,
        predicao_probabilidade: probabilidade,
        predicao_risco:         risco,
        predicao_data:          new Date(),
      },
    });
    res.json(patient);
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({ where: { is_active: true } });
    res.json(patients);
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { id: Number(req.params.id) } });
    if (!patient || !patient.is_active)
      return res.status(404).json({ detail: 'Paciente não encontrado.' });
    res.json(patient);
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, is_active } = req.body;
  try {
    const patient = await prisma.patient.findUnique({ where: { id: Number(req.params.id) } });
    if (!patient) return res.status(404).json({ detail: 'Paciente não existe.' });

    const data = {};
    if (name       !== undefined) data.name      = name;
    if (is_active  !== undefined) data.is_active = is_active;

    const updated = await prisma.patient.update({ where: { id: Number(req.params.id) }, data });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
});

module.exports = router;
