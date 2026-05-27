from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import timedelta
from src.database import prisma
from src.core.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Autenticação"])

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    crm_coren: str = None

@router.post("/register")
async def register(user: UserCreate):
    existing = await prisma.user.find_unique(where={"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já está em uso.")
        
    hashed_pass = get_password_hash(user.password)
    
    new_user = await prisma.user.create(
        data={
            "name": user.name,
            "email": user.email,
            "password_hash": hashed_pass,
            "crm_coren": user.crm_coren
        }
    )
    return {"message": "Médico/Usuário cadastrado com sucesso", "id": new_user.id}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await prisma.user.find_unique(where={"email": form_data.username})
    
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Usuário incorreto ou inativo.")
        
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Senha incorreta.")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": user.id}, expires_delta=access_token_expires)
    
    # É obrigatório retornar essa estrutura JSON exata pro Swagger funcionar
    return {"access_token": token, "token_type": "bearer"}