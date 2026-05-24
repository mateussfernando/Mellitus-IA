from fastapi import FastAPI
from prisma import Prisma

# Inicialização do FastAPI
app = FastAPI(
    title="Mellitus.IA API",
    description="API de backend para suporte a predições de Diabetes Tipo 2",
    version="1.0.0"
)

# Instância global do BD Prisma
prisma = Prisma()

@app.on_event("startup")
async def startup():
    # Conecta ao banco de dados assim que o servidor iniciar
    await prisma.connect()
    print("✅ Banco de dados conectado com sucesso!")

@app.on_event("shutdown")
async def shutdown():
    # Desconecta do banco de dados quando o servidor parar
    await prisma.disconnect()

@app.get("/")
async def root():
    return {"message": "A API do Mellitus.IA está rodando normalmente!"}
