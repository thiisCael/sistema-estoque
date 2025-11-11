import { api } from './api.js';

(function init(){
  if (!localStorage.getItem('token')) location.href='./login.html';
  loadResumo(); loadUltimas();
})();

async function loadResumo(){
  const r = await api('/estoque/resumo');
  document.querySelector('#kpi-total').textContent = `Produtos: ${r.totalProdutos}`;
  document.querySelector('#kpi-entradas').textContent = `Entradas (mês): ${r.entradasMes}`;
  document.querySelector('#kpi-saidas').textContent = `Saídas (mês): ${r.saidasMes}`;
  document.querySelector('#kpi-baixo').textContent = `Baixo estoque: ${r.estoqueBaixo}`;
}

async function loadUltimas(){
  const itens = await api('/movimentacoes?limit=10');
  const tbody = document.querySelector('#ultimas');
  tbody.innerHTML = itens.map(i=>`
    <tr>
      <td>${new Date(i.created_at).toLocaleString('pt-BR')}</td>
      <td>${i.produto}</td>
      <td>${i.tipo}</td>
      <td>${i.quantidade}</td>
      <td>${i.usuario}</td>
    </tr>`).join('');
}
