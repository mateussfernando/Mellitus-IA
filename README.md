# Mellitus-IA

## 📖 Sobre o Projeto

**Mellitus-IA** é um sistema de Inteligência Artificial focado na predição de probabilidade e risco de **Diabetes Tipo 2**. A aplicação conta com um modelo Machine Learning próprio consumido através de uma API estruturada em **FastAPI** e banco de dados **PostgreSQL** orquestrado pelo **Prisma ORM**. Todo o sistema de requisições é **protegido por JWT**.

---

## 🚀 Como Rodar o Projeto Passo a Passo

Siga o tutorial abaixo para configurar e ligar o sistema corretamente.

### 1. Clonar o Repositório e Preparar o Ambiente

Primeiro, clone o repositório ou entre na pasta do backend:

```bash
cd backend
```

Agora, crie e ative um ambiente virtual (`venv`) para garantir que as dependências do projeto não entrem em conflito com o seu computador:

- **No Windows (Git Bash ou PowerShell):**

```bash
python -m venv venv
source venv/Scripts/activate
```

- **No Linux/Mac:**

```bash
python3 -m venv venv
source venv/bin/activate
```

Com o `venv` ativo, instale todas as dependências do projeto:

```bash
pip install -r requirements.txt
```

### 2. Configurar o Banco de Dados (Prisma)

Ainda dentro da pasta `backend` com o `venv` ativo, gere os arquivos e aplique as tabelas no seu PostgreSQL.

```bash
# Push do Schema para o banco de dados
python -m prisma db push

# Geração das tipagens correspondentes do Cliente Prisma
python -m prisma generate
```

Caso queira carregar os dados iniciais do projeto para facilitar os testes na API (Criação de Dr. Teste):

```bash
python seed.py
```

### 3. Rodar o Servidor FastAPI

Após dependências instaladas e base de dados criada + populada, basta subir o servidor local na porta 8000:

```bash
uvicorn src.main:app --reload
```

A API estará rodando em `http://127.0.0.1:8000`. Você pode conferir a documentação detalhada (Swagger) em: **`http://127.0.0.1:8000/docs`**

---

## 🔒 Autenticação & Como fazer Requisições (Endpoints)

Todas as rotas críticas da API exigem autenticação baseada em Tokens de Acesso.

### Passo 1: Obtendo o Token de Acesso (Login)

Para gerar seu token, envie um **POST** para `/auth/login` passando os dados de acesso enviados através do formato `x-www-form-urlencoded`.

**Exemplo (cURL):**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=dr.teste@mellitus.com&password=123456'
```

**Resposta:**
Você receberá algo como:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "token_type": "bearer"
}
```

### Passo 2: Acessando as Rotas Protegidas

De posse do `access_token` devolvido, injete-o nos Cabeçalhos (_Headers_) HTTP de qualquer requisição bloqueada sob a chave de Authorization.

- O formato exigido é sempre literal: `Bearer <SEU_TOKEN>`.

**Exemplo de Predição/Criação de Paciente Autorizada:**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/patients/' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...' \
  -H 'Content-Type: application/json' \
  -d '{
  "nome_paciente": "Maria",
  "cpf": "123.456.789-10",
  "age": 45.0,
  "bmi": 28.5,
  "hbA1c_level": 5.9,
  "blood_glucose_level": 140.0,
  "hypertension": 0,
  "heart_disease": 0,
  "gender": 1,
  "smoking_history": 2
}'
```

Se o Token estiver certo, aparecerá a classificação de probabilidade do paciente processada pela Inteligência Artificial. Caso contrário: **`401 Unauthorized`**.

---

## 🗂️ Referência Rápida de Endpoints

Aqui estão listadas todas as rotas embutidas no sistema. Lembre-se, caso alguma rota exija parâmetros `id`, ele deve ser passado diretamente pela URL (Ex: `/patients/1`).

### 🌐 Gerais

- **`GET /`**: Verifica o status do servidor e se ele se encontra online.

### 🔑 Autenticação (`/auth`)

- **`POST /auth/register`**: Cadastra um novo médico/usuário no banco.
- **`POST /auth/login`**: Recebe o e-mail (username) e a senha e retorna um _Access Token (JWT)_.

### 🩺 Pacientes & Predição (`/patients`)

> **Atenção:** As rotas abaixo exigem obrigatoriamente o envio do token JWT via Header (`Authorization: Bearer <TOKEN>`).

- **`POST /patients/`**: Cadastra um novo paciente juntamente com seus exames clínicos. **Aciona a Inteligência Artificial imediatamente** e salva o percentual e o risco de Diabetes Tipo 2.
- **`GET /patients/`**: Lista todos os pacientes ativos registrados.
- **`GET /patients/{id}`**: Busca os detalhes completos, exames e as predições de IA de um paciente isolado.
- **`PUT /patients/{id}`**: Atualiza alguma informação, erro de digitação de cadastro (como alterar um nome) ou ativa/inativa o acesso do paciente (usando `is_active` igual a `true` ou `false`).

---

💡 **Dica Rápida:** Você pode testar toda a lógica de uso direto da interface Swagger acessando `http://localhost:8000/docs` através do seu navegador. Basta clicar no botão `Authorize` (O Cadeado no topo) e colocar `dr.teste@mellitus.com` e a senha `123456`.
