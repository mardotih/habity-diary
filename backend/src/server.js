// ──────────────────────────────────────────────────────────────────────────────
//  Ficheiro principal do servidor backend
//  Passo a passo:
//    1. Carrega variaveis de ambiente do ficheiro .env
//    2. Configura middlewares de seguranca (Helmet, CORS, Rate Limit)
//    3. Define as rotas da API (auth, habits, reminders, admin)
//    4. Trata erros 404 e erros globais
//    5. Conecta a base de dados, inicia o scheduler e comeca a servir
// ──────────────────────────────────────────────────────────────────────────────

// ─── 1. Carregar variaveis de ambiente ────────────────────────────────────────
require('dotenv').config();

// ─── 2. Importar dependencias ─────────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// ─── 3. Importar modulos internos ─────────────────────────────────────────────
const { testConnection } = require('./config/database');
const { startReminderScheduler } = require('./utils/scheduler');

const authRoutes     = require('./routes/auth');
const habitRoutes    = require('./routes/habits');
const reminderRoutes = require('./routes/reminders');
const adminRoutes    = require('./routes/admin');

// ─── 4. Instanciar servidor Express ───────────────────────────────────────────
const app = express();

// ─── 5. Configurar seguranca ──────────────────────────────────────────────────
app.use(helmet());                                          // Cabecalhos HTTP seguros
app.use(cors({                                              // Permitir pedidos do frontend
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// ─── 6. Rate limiting global (200 req / 15 min) ───────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas requisicoes. Tente novamente mais tarde.' }
}));

// ─── 7. Rate limit extra para autenticacao (20 req / 15 min) ──────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiadas tentativas de login. Aguarde 15 minutos.' }
});

// ─── 8. Middlewares de parsing e logging ──────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── 9. Definir rotas da API ──────────────────────────────────────────────────

//    9a. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
});

//    9b. Autenticacao (com rate limit mais restrito)
app.use('/api/auth',      authLimiter, authRoutes);

//    9c. Gestao de habitos
app.use('/api/habits',    habitRoutes);

//    9d. Lembretes agendados
app.use('/api/reminders', reminderRoutes);

//    9e. Administracao (apenas admin)
app.use('/api/admin',     adminRoutes);

// ─── 10. Middleware para rotas inexistentes (404) ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Rota ${req.method} ${req.path} nao encontrada.` });
});

// ─── 11. Middleware de erro global ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Erro nao tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// ─── 12. Inicializar servidor ─────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const start = async () => {
  // Passo 12a: testar ligacao a base de dados
  await testConnection();

  // Passo 12b: iniciar scheduler de lembretes (node-cron)
  startReminderScheduler();

  // Passo 12c: comecar a escutar pedidos HTTP
  app.listen(PORT, () => {
    console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
    console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
