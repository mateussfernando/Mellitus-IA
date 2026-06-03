require('dotenv').config();
const prisma = require('./src/database');
const { hashPassword } = require('./src/core/security');

async function main() {
  console.log('Iniciando seed do banco de dados...');

  const testEmail = 'dr.teste@mellitus.com';
  const existing  = await prisma.user.findUnique({ where: { email: testEmail } });

  if (!existing) {
    const user = await prisma.user.create({
      data: {
        name:     'Dr. Teste',
        email:    testEmail,
        password: hashPassword('123456'),
        crm:      '12345-SP',
        is_active: true,
      },
    });
    console.log(`Medico criado: ${user.name} (Email: ${user.email} | Senha: 123456)`);
  } else {
    console.log(`Medico ja existia: ${existing.name}`);
  }

  const testCpf          = '111.222.333-44';
  const existingPatient  = await prisma.patient.findUnique({ where: { cpf: testCpf } });

  if (!existingPatient) {
    const patient = await prisma.patient.create({
      data: {
        name:              'Paciente Joao',
        cpf:               testCpf,
        birth_date:        new Date('1980-05-15'),
        glicemia:          150.0,
        pressao:           80.0,
        imc:               32.5,
        idade:             46.0,
        gestacoes:         0.0,
        espessura_pele:    30.0,
        insulina:          120.0,
        historico_familiar: 0.8,
        is_active:         true,
      },
    });
    console.log(`Paciente criado: ${patient.name}`);
  } else {
    console.log(`Paciente ja existia: ${existingPatient.name}`);
  }

  console.log('Seed finalizado!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
