import { Router } from 'express';
import { q } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
const router = Router();

router.get('/', authMiddleware, requireRole('operador','gerente'), async (req,res)=>{

  const { rows } = await q(`
  SELECT 
    p.id, 
    p.nome, 
    p.unidade, 
    p.estoque_minimo, 
    p.ativo,
    c.nome AS categoria,
    COALESCE(s.saldo, 0) AS saldo,

    -- 🔹 Último destinatário que pegou o produto
    (
      SELECT m.destinatario 
      FROM movimentacoes m 
      WHERE m.produto_id = p.id 
        AND m.tipo = 'SAIDA'
      ORDER BY m.created_at DESC 
      LIMIT 1
    ) AS ultima_saida_destinatario,

    -- 🔹 Nome de quem registrou essa movimentação
    (
      SELECT u.nome 
      FROM movimentacoes m
      JOIN usuarios u ON u.id = m.registrado_por
      WHERE m.produto_id = p.id 
        AND m.tipo = 'SAIDA'
      ORDER BY m.created_at DESC 
      LIMIT 1
    ) AS registrada_por

  FROM produtos p
  JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN vw_saldo_atual s ON s.produto_id = p.id
  ORDER BY c.nome, p.nome;
`);
  res.json(rows);
});



router.post('/', authMiddleware, requireRole('operador'), async (req,res)=>{
  console.log('BODY RECEBIDO:', req.body); 
  const { categoria_id, nome, unidade, estoque_minimo, ativo=true } = req.body;
  await q(`INSERT INTO produtos (categoria_id,nome,unidade,estoque_minimo,ativo)
           VALUES ($1,$2,$3,$4,$5)`, [categoria_id,nome,unidade,estoque_minimo,ativo]);
  res.status(201).json({ ok:true });
});

router.put('/:id', authMiddleware, requireRole('operador'), async (req,res)=>{
  const { nome, unidade, estoque_minimo, ativo } = req.body;
  await q(`UPDATE produtos SET nome=$1, unidade=$2, estoque_minimo=$3, ativo=$4 WHERE id=$5`,
          [nome,unidade,estoque_minimo,ativo,req.params.id]);
  res.json({ ok:true });
});

router.delete('/:id', authMiddleware, requireRole('operador'), async (req,res)=>{
  await q(`DELETE FROM produtos WHERE id=$1`, [req.params.id]);
  res.json({ ok:true });
});

export default router;
