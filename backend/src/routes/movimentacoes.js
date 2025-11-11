import { Router } from 'express';
import { q } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

/** LISTAR movimentações (operador e gerente veem tudo) */
router.get('/', authMiddleware, requireRole('operador','gerente'), async (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  const { rows } = await q(`
    SELECT
      m.id,
      m.tipo,
      m.quantidade,
      m.destinatario,
      to_char(m.created_at AT TIME ZONE 'America/Sao_Paulo','DD/MM/YYYY HH24:MI') AS quando,
      p.nome  AS produto,
      u.nome  AS registrado_por
    FROM movimentacoes m
    JOIN produtos  p ON p.id = m.produto_id
    JOIN usuarios  u ON u.id = m.registrado_por      -- 🔹 usa a nova coluna 'registrado_por'
    ORDER BY m.created_at DESC
    LIMIT $1
  `, [limit]);
  res.json(rows);
});

/** REGISTRAR movimentação (operador e gerente podem mexer) */
router.post('/', authMiddleware, requireRole('operador','gerente'), async (req, res) => {
  try {
    const { produto_id, tipo, quantidade, destinatario } = req.body;

    if (!produto_id || !tipo || !quantidade) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
    }

    const userId = req.user.id; // 🔹 pega o ID do usuário logado via JWT

    // Inserir movimentação com quem registrou
    await q(`
      INSERT INTO movimentacoes (produto_id, tipo, quantidade, destinatario, registrado_por)
      VALUES ($1, $2, $3, $4, $5)
    `, [produto_id, tipo, quantidade, destinatario || null, userId]);

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao registrar movimentação.' });
  }
});

export default router;
