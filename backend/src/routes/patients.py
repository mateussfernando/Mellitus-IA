from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from src.database import prisma
from src.core.security import get_current_user
from src.core.model_loader import prever_risco_diabetes

router = APIRouter(prefix="/patients", tags=["Pacientes e IA"])

class PatientCreate(BaseModel):
    name: str
    cpf: str
    birth_date: datetime
    
    # Médicos/Clínicos Obrigatórios
    glicemia: float
    pressao: float
    imc: float
    idade: float
    
    # Opcionais
    gestacoes: Optional[float] = None
    espessura_pele: Optional[float] = None
    insulina: Optional[float] = None
    historico_familiar: Optional[float] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    # Adicionar outros se necessário futuramente

@router.post("/")
async def create_patient_with_ai(data: PatientCreate, current_user_id: int = Depends(get_current_user)):
    try:
        # A Mágica Acontece Aqui: Passa os dados pra Inteligência Artificial antes de ir pro banco
        dados = data.dict()
        prob, risco = prever_risco_diabetes(dados)
        
        # Agora sim salva no PostgreSQL com as previsões atreladas
        patient = await prisma.patient.create(
            data={
                "name": data.name,
                "cpf": data.cpf,
                "birth_date": data.birth_date,
                
                "glicemia": data.glicemia,
                "pressao": data.pressao,
                "imc": data.imc,
                "idade": data.idade,
                
                "gestacoes": data.gestacoes,
                "espessura_pele": data.espessura_pele,
                "insulina": data.insulina,
                "historico_familiar": data.historico_familiar,
                
                "predicao_probabilidade": prob,
                "predicao_risco": risco,
                "predicao_data": datetime.utcnow()
            }
        )
        return patient
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_active_patients(current_user_id: int = Depends(get_current_user)):
    return await prisma.patient.find_many(
        where={"is_active": True},
        # Caso queira filtrar pro medico só ver os que ele criou: 
        # where={"is_active": True, "user_id": current_user_id}
    )

@router.get("/{id}")
async def get_patient_by_id(id: int, current_user_id: int = Depends(get_current_user)):
    patient = await prisma.patient.find_unique(where={"id": id})
    if not patient or not patient.is_active:
        raise HTTPException(status_code=404, detail="Paciente não encontrado.")
    return patient

@router.put("/{id}")
async def update_patient(id: int, data: PatientUpdate, current_user_id: int = Depends(get_current_user)):
    patient = await prisma.patient.find_unique(where={"id": id})
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não existe.")
        
    update_data = data.dict(exclude_unset=True)
    updated = await prisma.patient.update(where={"id": id}, data=update_data)
    return updated