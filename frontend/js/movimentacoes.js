import { apiRequest } from './api.js';

const token = localStorage.getItem('token');
if (!token) {
  alert('Sessão expirada. Faça login novamente.');
  window.location.href = './login.html';
}

const produtoSelect = document.getElementById('produto_id');
const form = document.getElementById('movForm');
const msg = document.getElementById('mensagem');
const voltarBtn = document.getElementById('voltarBtn');

// carregar produtos no select
async function carregarProdutos() {
  try {
    const produtos = await apiRequest('/produtos', 'GET');
    produtoSelect.innerHTML = produtos
      .map(p => `<option value="${p.id}">${p.nome} (${p.categoria})</option>`)
      .join('');
  } catch (err) {
    msg.textContent = 'Erro ao carregar produtos.';
    msg.style.color = 'red';
  }
}

// registrar movimentação
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
    msg.textContent = `Movimentação registrada com sucesso! Novo saldo: ${resp.novo_saldo}`;
    msg.style.color = 'green';
    form.reset();
  } catch (err) {
    msg.textContent = err.message || 'Erro ao registrar movimentação.';
    msg.style.color = 'red';
  }
});

voltarBtn.addEventListener('click', () => {
  window.location.href = './produtos.html';
});

carregarProdutos();
