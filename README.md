# 🩺 Mellitus.IA

> Assistente médico inteligente: escaneie laudos, acompanhe a evolução dos pacientes e receba análises clínicas que cruzam todos os exames — revelando padrões que passariam despercebidos.

Aplicação full-stack em **Next.js** que transforma exames laboratoriais (PDF, foto ou entrada manual) em acompanhamento clínico longitudinal, com leitura automática de laudos e análise por IA.

---

## ✨ Funcionalidades

- 🔐 **Autenticação** por e-mail/senha (NextAuth + bcrypt), com sessão persistente de 30 dias.
- 👥 **Gestão de pacientes** isolada por usuário — cada médico só vê os seus pacientes (identificados por CPF).
- 📄 **Leitura de laudos por IA** — envie um PDF ou foto e os valores são extraídos automaticamente para conferência.
- ✍️ **Entrada manual** — 14 categorias de exames com ~60 parâmetros e unidades pré-mapeados.
- 📊 **Página de detalhe do paciente** — dados básicos, medidas mais recentes, mini-dashboard e histórico completo com todos os valores (com destaque para os fora da faixa de referência).
- 🧠 **Análise clínica** — cruza todo o histórico e aponta tendências, correlações entre domínios, alertas e sugestões.
- 🚦 **Alertas instantâneos** (sem IA) — valores fora de faixa sinalizados na hora por regras clínicas.

---

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Frontend / Backend | Next.js 16 (App Router) + React 19 |
| Estilo | Tailwind CSS v4 |
| Autenticação | NextAuth v5 (JWT) + bcryptjs |
| ORM / Banco | Prisma 6 + PostgreSQL (Azure) |
| IA | Claude (Anthropic) via `@anthropic-ai/sdk` — visão para OCR e análise de texto |
| Animações | GSAP (landing page) |
| Deploy | Vercel |

---

## 🗂️ Estrutura

```
react-next/
├── prisma/
│   ├── schema.prisma        # User, Patient (com CPF + user_id), ExamResult
│   └── seed.js              # 9 pacientes de demonstração com históricos variados
├── src/
│   ├── app/
│   │   ├── page.js                       # Landing page (GSAP)
│   │   ├── login/                        # Login + cadastro
│   │   ├── dashboard/                    # Lista de pacientes + estatísticas
│   │   │   └── pacientes/[id]/
│   │   │       ├── page.js                # Detalhe do paciente
│   │   │       ├── exame/                 # Adicionar exame (IA ou manual)
│   │   │       └── insights/              # Análise por IA
│   │   └── api/
│   │       ├── auth/                      # NextAuth + registro
│   │       ├── patients/                  # CRUD de pacientes e exames
│   │       └── exams/scan/                # OCR de laudos com IA
│   ├── components/                        # Modais, cards e telas client-side
│   └── lib/
│       ├── prisma.js                      # Singleton do Prisma Client
│       ├── middleware.js                  # withAuth + hash de senha
│       ├── alerts.js                      # Regras clínicas / thresholds
│       └── examCatalog.js                 # Catálogo de categorias e parâmetros
```

---

## 🚀 Começando

### Pré-requisitos
- Node.js 20+
- Um banco PostgreSQL (ex.: Azure, Supabase, local)
- Uma chave de API da Anthropic (para leitura de laudos e análise)

### 1. Instalar dependências
```bash
cd react-next
npm install
```

### 2. Variáveis de ambiente
Crie `react-next/.env` com:
```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?sslmode=require"
NEXTAUTH_SECRET="uma-string-secreta-aleatoria"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```
> Caracteres especiais na senha (ex.: `@`) devem usar URL-encoding (`%40`). No painel da Vercel, informe os valores **sem aspas**.

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

## ☁️ Deploy (Vercel)

1. Importe o repositório na Vercel (diretório raiz: `react-next`).
2. Configure as variáveis de ambiente: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (com a URL de produção) e `ANTHROPIC_API_KEY` — **sem aspas**.
3. O build roda `prisma generate && next build`.
4. Libere o firewall do banco para as conexões da Vercel.

---

## ⚠️ Aviso

Projeto de uso **clínico e educacional**. As análises são de apoio à decisão e **não substituem** a avaliação de um profissional de saúde. Dados de pacientes devem ser tratados em conformidade com a **LGPD (Lei 13.709/2018)**.
