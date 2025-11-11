import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// Rotas
import authRoutes from './routes/auth.js';
import estoqueRoutes from './routes/estoque.js';
import movimentacoesRoutes from './routes/movimentacoes.js';
import produtosRoutes from './routes/produtos.js';
import usuariosRoutes from './routes/usuarios.js';

dotenv.config();

const app = express();


app.use(express.json()); 
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Segurança e logs
app.use(helmet());
app.use(morgan('dev'));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/teste', (req, res) => {
  console.log('🧩 Body recebido:', req.body);
  res.json({ recebido: req.body });
});

export default app;
