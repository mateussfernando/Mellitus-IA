import asyncio
from prisma import Prisma
from src.core.security import get_password_hash
from datetime import datetime

async def main() -> None:
    prisma = Prisma()
    await prisma.connect()

    print("🌱 Iniciando o Seed do Banco de Dados...")

    # 1. Criação do Médico "Dr. Teste" com senha "123456"
    test_email = "dr.teste@mellitus.com"
    existing_user = await prisma.user.find_unique(where={"email": test_email})
    
    if not existing_user:
        user = await prisma.user.create(
            data={
                "name": "Dr. Teste",
                "email": test_email,
                "password": get_password_hash("123456"),
                "crm": "12345-SP",
                "is_active": True
            }
        )
        print(f"✅ Médico criado: {user.name} (Email: {user.email} | Senha: 123456)")
    else:
        user = existing_user
        print(f"✅ Médico já existia: {user.name}")

    # 2. Criação de um Paciente de Teste vinculado ao Dr. Teste
    test_cpf = "111.222.333-44"
    existing_patient = await prisma.patient.find_unique(where={"cpf": test_cpf})

    if not existing_patient:
        patient = await prisma.patient.create(
            data={
                "name": "Paciente João",
                "cpf": test_cpf,
                "birth_date": datetime(1980, 5, 15),
                # Dados Clínicos
                "glicemia": 150.0,
                "pressao": 80.0,
                "imc": 32.5,
                "idade": 46.0,
                # Dados Opcionais preenchidos para compor a IA amanhã
                "gestacoes": 0.0,
                "espessura_pele": 30.0,
                "insulina": 120.0,
                "historico_familiar": 0.8,
                "is_active": True,
            }
        )
        print(f"✅ Paciente criado: {patient.name} (CPF: {patient.cpf})")
    else:
        print(f"✅ Paciente já existia: {existing_patient.name}")

    print("🎉 Seed finalizado com sucesso!")
    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())