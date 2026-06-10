# Mellitus.IA

> Assistente médico inteligente: escaneie laudos, acompanhe a evolução dos pacientes e receba análises clínicas que cruzam todos os exames — revelando padrões que passariam despercebidos.

Aplicação full-stack em **Next.js** que transforma exames laboratoriais (PDF, foto ou entrada manual) em acompanhamento clínico longitudinal, com leitura automática de laudos e análise por IA.

---

## Funcionalidades

- **Autenticação** por e-mail/senha (NextAuth + bcrypt), com sessão persistente de 30 dias.
- **Gestão de pacientes** isolada por usuário — cada médico só vê os seus pacientes (identificados por CPF).
- **Leitura de laudos por IA** — envie um PDF ou foto e os valores são extraídos automaticamente para conferência.
- **Entrada manual** — 14 categorias de exames com ~60 parâmetros e unidades pré-mapeados.
- **Edição e remoção de exames** — corrija ou remova exames já cadastrados a qualquer momento.
- **Página de detalhe do paciente** — dados básicos, medidas mais recentes, mini-dashboard e histórico completo com todos os valores (com destaque para os fora da faixa de referência).
- **Risco de diabetes por Machine Learning** — modelo Random Forest (treinado em JS, sem Python/ONNX) classifica o risco de diabetes tipo 2 em BAIXO/MÉDIO/ALTO.
- **Análise clínica por IA** — cruza todo o histórico, valida a classificação de risco do modelo de ML e aponta tendências, correlações entre domínios, alertas e sugestões.
- **Alertas instantâneos** (sem IA) — valores fora de faixa sinalizados na hora por regras clínicas.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend / Backend | Next.js 16 (App Router) + React 19 |
| Estilo | Tailwind CSS v4 |
| Autenticação | NextAuth v5 (JWT) + bcryptjs |
| ORM / Banco | Prisma 6 + PostgreSQL (Azure ou local) |
| Machine Learning | Random Forest (`ml-random-forest`), treinado e executado em JavaScript |
| IA generativa | Claude (Anthropic) via `@anthropic-ai/sdk` — visão para OCR e análise de texto |
| Animações | GSAP (landing page) |
| Deploy | Vercel |

---

## Estrutura

```
model/
├── train.js                  # Treina o Random Forest a partir do dataset Kaggle
└── diabetes_prediction_dataset.csv  # Dataset de treino (não versionado)
prisma/
├── schema.prisma            # User, Patient (com CPF + user_id), ExamResult
└── seed.js                  # 9 pacientes de demonstração com históricos variados
src/
├── app/
│   ├── page.js                       # Landing page (GSAP)
│   ├── login/                        # Login + cadastro
│   ├── dashboard/                    # Lista de pacientes + estatísticas
│   │   └── pacientes/[id]/
│   │       ├── page.js                # Detalhe do paciente
│   │       ├── exame/                 # Adicionar/editar exame (IA ou manual)
│   │       └── insights/              # Análise por IA + risco de ML
│   └── api/
│       ├── auth/                      # NextAuth + registro
│       ├── patients/                  # CRUD de pacientes e exames
│       └── exams/scan/                # OCR de laudos com IA
├── components/                        # Modais, cards e telas client-side
└── lib/
    ├── prisma.js                      # Singleton do Prisma Client
    ├── middleware.js                  # withAuth + hash de senha
    ├── alerts.js                      # Regras clínicas / thresholds
    ├── examCatalog.js                 # Catálogo de categorias e parâmetros
    ├── riskModel.js                   # Inferência do modelo de risco (Random Forest)
    └── risk_model.json                # Modelo treinado (gerado por `npm run train`)
```

---

## Começando

### Pré-requisitos
- Node.js 20+
- Um banco PostgreSQL (ex.: Azure, Supabase, local)
- Uma chave de API da Anthropic (para leitura de laudos e análise)

### 1. Instalar dependências
```bash
npm install
```

### 2. Variáveis de ambiente
Crie um arquivo `.env` na raiz com:
```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?sslmode=require"
NEXTAUTH_SECRET="uma-string-secreta-aleatoria"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```
> Caracteres especiais na senha (ex.: `@`) devem usar URL-encoding (`%40`). No painel da Vercel, informe os valores **sem aspas**.

> Para desenvolvimento local com PostgreSQL instalado na máquina, use:
> `DATABASE_URL="postgresql://postgres:senha@localhost:5432/mellitus-ia"`

### 3. Banco de dados
```bash
npx prisma db push      # cria as tabelas a partir do schema
npx prisma db seed      # (opcional) popula 9 pacientes de demonstração
```

### 4. Rodar
```bash
npm run dev
```
Acesse http://localhost:3000.

> Os pacientes de demonstração são associados ao **primeiro usuário** do banco. Cadastre-se e rode o seed, ou faça login com a conta dona dos dados.

---

## Modelo de risco (Machine Learning)

O risco de diabetes tipo 2 é classificado por um **Random Forest** treinado em JavaScript (`ml-random-forest`), sem dependências de Python ou ONNX. O modelo já vem treinado em `src/lib/risk_model.json` e é carregado em runtime por `src/lib/riskModel.js`.

Para retreinar com o dataset do Kaggle ["Diabetes Prediction Dataset"](https://www.kaggle.com/datasets/iammustafatz/diabetes-prediction-dataset) (Mohammed Mustafa):

1. Baixe o CSV e salve em `model/diabetes_prediction_dataset.csv`.
2. Rode:
```bash
npm run train
```
Isso gera um novo `src/lib/risk_model.json` com métricas (acurácia, AUC, recall, precisão, F1) impressas no console.

---

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (com a URL de produção) e `ANTHROPIC_API_KEY` — **sem aspas**.
3. O build roda `prisma generate && next build`.
4. Libere o firewall do banco para as conexões da Vercel.

---

## Aviso

Projeto de uso **clínico e educacional**. As análises são de apoio à decisão e **não substituem** a avaliação de um profissional de saúde. Dados de pacientes devem ser tratados em conformidade com a **LGPD (Lei 13.709/2018)**.
