import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { q } from '../db.js';
const router = Router();


router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const { rows } = await q('SELECT id,nome,email,senha_hash,role FROM usuarios WHERE email=$1 AND ativo=TRUE', [email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(senha, u.senha_hash))) return res.status(401).json({ message: 'Credenciais inválidas' });
  const token = jwt.sign({ id: u.id, role: u.role, nome: u.nome }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, usuario: { id: u.id, nome: u.nome, role: u.role, email: u.email }});
});

// Criar usuário (apenas operador pode criar gerente? melhor: **operador** não cria; **apenas operador!=**)
// Decisão forte: **somente operador cria usuários**? Melhor: **somente operador (admin)**.
router.post('/register', async (req, res) => {
  const { nome, email, senha, role } = req.body; // role: 'operador' | 'gerente'
  const hash = await bcrypt.hash(senha, 10);
  await q('INSERT INTO usuarios (nome,email,senha_hash,role) VALUES ($1,$2,$3,$4)', [nome,email,hash,role]);
  res.status(201).json({ ok: true });
});

export default router;
