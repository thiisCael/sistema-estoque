import bcrypt from 'bcrypt';
import { Router } from 'express';
import { q } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

//  Listar todos os usuários (somente gerente)
router.get('/', authMiddleware, requireRole('gerente'), async (req, res) => {
  try {
    const { rows } = await q(`
      SELECT id, nome, email, role
      FROM usuarios
      ORDER BY nome
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// ➕ Criar novo usuário (somente gerente)
router.post('/', authMiddleware, requireRole('gerente'), async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;

    if (!nome || !email || !senha || !role) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    // Verifica se já existe e-mail cadastrado
    const { rowCount } = await q(`SELECT 1 FROM usuarios WHERE email=$1`, [email]);
    if (rowCount > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    // Criptografa senha
    const senha_hash = await bcrypt.hash(senha, 10);

    await q(
      `INSERT INTO usuarios (nome, email, senha_hash, role)
       VALUES ($1, $2, $3, $4)`,
      [nome, email, senha_hash, role]
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

export default router;
