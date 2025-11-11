import { apiRequest } from './api.js';

// === ELEMENTOS ===
const tabela = document.querySelector('#tabela-produtos tbody');
const produtoSelect = document.getElementById('produto_id');
const msg = document.getElementById('mensagem');
const form = document.getElementById('movForm');
const sairBtn = document.getElementById('sairBtn');

// === VALIDA TOKEN ===
const token = localStorage.getItem('token');
if (!token) {
  alert('Sessão expirada. Faça login novamente.');
  window.location.href = './login.html';
}

// === DADOS EM MEMÓRIA ===
let produtosData = [];

// === CARREGAR PRODUTOS ===
async function carregarProdutos() {
  try {
    const produtos = await apiRequest('/produtos', 'GET');
    produtosData = produtos;

    console.log('Produtos recebidos:', produtosData);

    renderizarTabela();
    preencherSelectProdutos();
    atualizarResumoEstoque();

  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    tabela.innerHTML = '<tr><td colspan="6">Erro ao carregar produtos.</td></tr>';
  }
}

// === RENDERIZAR TABELA ===
function renderizarTabela() {
  tabela.innerHTML = '';

  if (!produtosData || produtosData.length === 0) {
    tabela.innerHTML = '<tr><td colspan="6">Nenhum produto encontrado.</td></tr>';
    return;
  }

  produtosData.forEach(p => {
    const status =
      p.saldo === 0
        ? '<span class="badge badge-danger">🔴 Crítico</span>'
        : p.saldo <= p.estoque_minimo
        ? '<span class="badge badge-warning">⚠️ Baixo</span>'
        : '<span class="badge badge-success">✅ OK</span>';

    tabela.innerHTML += `
      <tr>
        <td><strong>${p.nome}</strong></td>
        <td>${p.categoria?.nome ?? p.categoria}</td>
        <td>${p.unidade}</td>
        <td>${p.estoque_minimo}</td>
        <td><strong>${p.saldo}</strong></td>
        <td>${status}</td>
      </tr>
    `;
  });
}

// === PREENCHER SELECT ===
function preencherSelectProdutos() {
  produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';

  produtosData.forEach(p => {
    produtoSelect.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
  });
}

// === RESUMO DO ESTOQUE ===
function atualizarResumoEstoque() {
  const totalProdutos = produtosData.length;
  const estoqueBaixo = produtosData.filter(p => p.saldo <= p.estoque_minimo).length;
  const estoqueTotal = produtosData.reduce((sum, p) => sum + Number(p.saldo || 0), 0);

  if (document.getElementById('totalProdutos'))
    document.getElementById('totalProdutos').textContent = totalProdutos;

  if (document.getElementById('estoqueBaixo'))
    document.getElementById('estoqueBaixo').textContent = estoqueBaixo;

  if (document.getElementById('estoqueTotal'))
    document.getElementById('estoqueTotal').textContent = estoqueTotal.toLocaleString('pt-BR');
}

// === REGISTRAR MOVIMENTAÇÃO ===
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    produto_id: produtoSelect.value,
    tipo: document.getElementById('tipo').value,
    quantidade: Number(document.getElementById('quantidade').value),
    destinatario: document.getElementById('destinatario').value
  };

  try {
    const resp = await apiRequest('/movimentacoes', 'POST', data);
    msg.textContent = `✅ Movimentação registrada com sucesso! Novo saldo: ${resp.novo_saldo}`;
    msg.className = 'success';

    await carregarProdutos();
    form.reset();

    setTimeout(() => {
      msg.textContent = '';
      msg.className = '';
    }, 5000);
  } catch (err) {
    msg.textContent = `❌ ${err.message || 'Erro ao registrar movimentação.'}`;
    msg.className = 'error';
  }
});

// === BOTÃO SAIR ===
sairBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = './login.html';
});

// === INICIALIZAR ===
carregarProdutos();
