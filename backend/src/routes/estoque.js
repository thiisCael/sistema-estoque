import { Router } from 'express';
import { q } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
const router = Router();

router.get('/saldo', authMiddleware, requireRole('operador','gerente'), async (req,res)=>{
  const { rows } = await q(`
    SELECT p.id, p.nome, c.nome AS categoria, COALESCE(s.saldo,0) AS saldo, p.estoque_minimo
    FROM produtos p
    JOIN categorias c ON c.id = p.categoria_id
    LEFT JOIN vw_saldo_atual s ON s.produto_id = p.id
    ORDER BY c.nome, p.nome`);
  res.json(rows);
});

router.get('/resumo', authMiddleware, requireRole('operador','gerente'), async (req,res)=>{
  const total = await q('SELECT COUNT(*)::int AS n FROM produtos');
  const entradas = await q(`SELECT COALESCE(SUM(quantidade),0) AS n FROM movimentacoes
                            WHERE date_trunc('month',created_at)=date_trunc('month',now()) AND tipo='ENTRADA'`);
  const saidas = await q(`SELECT COALESCE(SUM(quantidade),0) AS n FROM movimentacoes
                          WHERE date_trunc('month',created_at)=date_trunc('month',now()) AND tipo='SAIDA'`);
  const baixo = await q(`
    SELECT COUNT(*)::int AS n FROM (
      SELECT p.id, COALESCE(s.saldo,0) AS saldo, p.estoque_minimo
      FROM produtos p LEFT JOIN vw_saldo_atual s ON s.produto_id=p.id
    ) t WHERE t.saldo <= t.estoque_minimo
  `);
  res.json({
    totalProdutos: total.rows[0].n,
    entradasMes: entradas.rows[0].n,
    saidasMes: saidas.rows[0].n,
    estoqueBaixo: baixo.rows[0].n
  });
});

export default router;
