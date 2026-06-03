# Diario de Habitos

Aplicacao Web full-stack para acompanhar habitos diarios com lembretes automaticos, estatisticas visuais e painel de administracao.

---

## Funcionalidades

| Area | Funcionalidades |
|---|---|
| **Autenticacao** | Registo, Login, JWT, Perfis com roles (user / admin) |
| **Habitos** | Criar, editar, eliminar, marcar como concluido por dia |
| **Lembretes** | Agendamento por hora e dias da semana (cron job) |
| **Estatisticas** | Graficos semanais, mensais, ranking de habitos, taxa de conclusao |
| **Admin** | Gestao de utilizadores, activar/desactivar, alterar roles, dashboard global |
| **Seguranca** | Helmet, CORS, Rate Limiting, validacao de inputs, bcrypt |

---

## Stack Tecnologica

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS + Recharts + React Router v6 |
| **Backend** | Node.js + Express + express-validator + JWT + bcryptjs + node-cron |
| **Base de Dados** | PostgreSQL 15 |
| **Infraestrutura** | Docker + Docker Compose (opcional) |

---

## Requisitos

- **Node.js** 20 ou superior
- **PostgreSQL** 15 instalado e a correr
- **Git** (opcional, para clonar o repositorio)
- **Docker Desktop** (opcional, para executar com Docker)

---

## Como executar o projeto

### Metodo 1: Usando Docker (recomendado)

```bash
# 1. Clonar o repositorio
git clone https://github.com/SEU_UTILIZADOR/habit-diary.git
cd habit-diary

# 2. Iniciar todos os servicos
docker compose up --build
```

Aguardar ate ver:
```
Base de dados conectada
Servidor a correr em http://localhost:4000
Scheduler de lembretes iniciado
```

### Metodo 2: Sem Docker (Windows)

**Passo 1: Configurar a base de dados**

```powershell
# Criar a base de dados
psql -U postgres -c "CREATE DATABASE habit_diary;"

# Executar o schema (tabelas e dados iniciais)
psql -U postgres -d habit_diary -f docker/init.sql
```

**Passo 2: Configurar e iniciar o backend**

```powershell
cd backend

# Copiar ficheiro de ambiente
copy .env.example .env

# Editar o .env com a password do PostgreSQL
# Abrir o ficheiro .env e alterar DB_PASSWORD

# Instalar dependencias
npm install

# Iniciar servidor
node src/server.js
```

**Passo 3: Configurar e iniciar o frontend**

```powershell
cd frontend

# Copiar ficheiro de ambiente
copy .env.example .env

# Instalar dependencias
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**Passo 4: Abrir no browser**

Aceder a http://localhost:5173

### Metodo 3: Usando o script automatico (Windows)

Fazer duplo clique no ficheiro `iniciar.bat` que se encontra na raiz do projeto.

Este script:
1. Fecha servidores anteriores
2. Abre uma janela para o backend (porta 4000)
3. Abre uma janela para o frontend (porta 5173)
4. Abre o browser automaticamente

### Metodo 4: Usando VS Code

1. Abrir a pasta do projeto no VS Code
2. Abrir o terminal integrado (Ctrl + `)
3. Executar as tasks:
   - `Ctrl + Shift + B` e selecionar "Iniciar Backend"
   - `Ctrl + Shift + B` e selecionar "Iniciar Frontend"
4. Ou usar a configuracao de debug (F5) para iniciar o projeto completo

---

## Credenciais de Acesso

| Tipo | Email | Password |
|---|---|---|
| **Administrador** | admin@habitdiary.com | Admin@123 |
| **Utilizador normal** | registar na aplicacao | - |

---

## Estrutura do Projeto

```
habit-diary/
├── backend/                  # API RESTful (Node.js + Express)
│   ├── src/
│   │   ├── config/           # Conexao a base de dados (PostgreSQL)
│   │   ├── controllers/      # Logica de negocio
│   │   ├── middleware/        # JWT Auth, roles
│   │   ├── routes/           # Rotas HTTP estruturadas
│   │   └── utils/            # Scheduler de lembretes (node-cron)
│   ├── .env                  # Variaveis de ambiente
│   └── package.json          # Dependencias do backend
├── frontend/                 # SPA (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Layout, componentes reutilizaveis
│   │   ├── context/          # AuthContext (estado global)
│   │   ├── pages/            # Dashboard, Habitos, Stats, Lembretes, Admin
│   │   └── services/         # Camada de API (Axios)
│   ├── .env                  # Variaveis de ambiente
│   └── package.json          # Dependencias do frontend
├── docker/
│   └── init.sql              # Schema da base de dados
├── docker-compose.yml        # Orquestracao Docker
├── iniciar.bat               # Script de inicializacao (Windows)
├── .vscode/                  # Configuracoes do VS Code
│   ├── launch.json           # Debug config
│   ├── tasks.json            # Tarefas automatizadas
│   └── settings.json         # Configuracoes do editor
└── README.md                 # Este ficheiro
```

---

## API - Endpoints

### Autenticacao

| Metodo | Rota | Descricao | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Criar conta | - |
| POST | `/api/auth/login` | Entrar | - |
| GET | `/api/auth/me` | Dados do utilizador | Sim |
| PUT | `/api/auth/profile` | Actualizar perfil | Sim |

### Habitos

| Metodo | Rota | Descricao | Auth |
|---|---|---|---|
| GET | `/api/habits` | Listar todos | Sim |
| POST | `/api/habits` | Criar habito | Sim |
| PUT | `/api/habits/:id` | Actualizar | Sim |
| DELETE | `/api/habits/:id` | Eliminar | Sim |
| POST | `/api/habits/:id/complete` | Toggle check-in | Sim |
| GET | `/api/habits/stats/summary` | Estatisticas | Sim |

### Lembretes

| Metodo | Rota | Descricao | Auth |
|---|---|---|---|
| GET | `/api/reminders` | Listar | Sim |
| POST | `/api/reminders` | Criar | Sim |
| PUT | `/api/reminders/:id` | Actualizar | Sim |
| DELETE | `/api/reminders/:id` | Eliminar | Sim |

### Administracao (role: admin)

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/api/admin/stats` | Estatisticas globais |
| GET | `/api/admin/users` | Listar utilizadores |
| PUT | `/api/admin/users/:id/toggle` | Activar/Desactivar |
| PUT | `/api/admin/users/:id/role` | Alterar role |

---

## Modelo Entidade-Relacao

```
┌─────────────┐       ┌───────────────────┐       ┌──────────────────────┐
│    users    │       │      habits       │       │  habit_completions   │
├─────────────┤       ├───────────────────┤       ├──────────────────────┤
│ id (PK)     │──┐    │ id (PK)           │──┐    │ id (PK)              │
│ name        │  └───>│ user_id (FK)      │  └───>│ habit_id (FK)        │
│ email       │       │ title             │        │ user_id (FK)         │
│ password_   │       │ description       │        │ completed_date (DATE)│
│   hash      │       │ icon              │        │ note                 │
│ role        │       │ color             │        │ created_at           │
│ avatar_color│       │ frequency         │        └──────────────────────┘
│ is_active   │       │ target_days       │
│ created_at  │       │ is_active         │       ┌──────────────────────┐
│ updated_at  │       │ created_at        │       │      reminders       │
└─────────────┘       │ updated_at        │       ├──────────────────────┤
       │              └───────────────────┘  ┌───│ id (PK)              │
       └─────────────────────────────────────┘   │ user_id (FK)         │
                                                   │ habit_id (FK, null)  │
                                                   │ label                │
                                                   │ reminder_time (TIME) │
                                                   │ days_of_week         │
                                                   │ is_active            │
                                                   │ last_triggered       │
                                                   │ created_at           │
                                                   └──────────────────────┘
```

### Relacionamentos

- **users 1 -> N habits**: Um utilizador pode ter varios habitos
- **users 1 -> N habit_completions**: Um utilizador pode ter varias conclusoes
- **habits 1 -> N habit_completions**: Um habito pode ter varias conclusoes (uma por dia)
- **users 1 -> N reminders**: Um utilizador pode ter varios lembretes
- **habits 0..1 -> N reminders**: Um lembrete pode estar associado a um habito (opcional)

---

## Seguranca Implementada

- **JWT**: Autenticacao stateless com expiracao de 7 dias
- **bcrypt**: Hashing de senhas com 10 rounds de salt
- **Helmet**: Headers HTTP seguros (XSS, MIME sniffing)
- **CORS**: Origem restrita ao dominio do frontend
- **Rate Limiting**: 200 req/15min global; 20 req/15min em auth
- **express-validator**: Validacao e sanitizacao de todos os inputs
- **Roles**: Middleware de autorizacao para rotas protegidas
- **Soft delete**: Habitos marcados como is_active=false em vez de eliminados

---

## Resolucao de Problemas

**Porta 5432 ja em uso:**
Alterar a porta no docker-compose.yml para "5433:5432"

**Servidor nao arranca:**
```bash
docker compose logs backend
docker compose logs postgres
```

**Reiniciar do zero:**
```bash
docker compose down -v
docker compose up --build
```

**Erro de conexao a base de dados:**
- Verificar se o PostgreSQL esta a correr
- Confirmar a password no ficheiro backend/.env
- Confirmar que a base de dados habit_diary foi criada
