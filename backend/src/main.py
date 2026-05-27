from fastapi import FastAPI
from src.database import prisma
from src.core.model_loader import load_model
from src.routes.auth import router as auth_router
from src.routes.patients import router as patients_router

# Inicialização do FastAPI
app = FastAPI(
    title="Mellitus.IA API",
    description="API de backend protegida para predições precisas de Diabetes Tipo 2",
    version="1.0.0"
)

@app.on_event("startup")
async def startup():
    # Conecta ao banco de dados e carrega o modelo de IA
    await prisma.connect()
    load_model()
    print("✅ Banco de dados e IA conectados com sucesso!")

@app.on_event("shutdown")
async def shutdown():
    # Desconecta do banco de dados
    await prisma.disconnect()

@app.get("/")
async def root():
    return {"message": "A API do Mellitus.IA está no ar e protegida!"}

# Integração das rotas (Auth e CRUD)
app.include_router(auth_router)
app.include_router(patients_router)
