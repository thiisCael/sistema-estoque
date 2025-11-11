import { apiRequest } from "./api.js";

const tbody = document.querySelector("#produtos tbody");
const logoutBtn = document.getElementById("logout");

async function carregarProdutos() {
  try {
    const produtos = await apiRequest("/produtos", "GET");
    tbody.innerHTML = "";

    produtos.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.nome}</td>
        <td>${p.categoria}</td>
        <td>${p.unidade}</td>
        <td>${p.estoque_minimo}</td>
        <td>${p.saldo}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    alert("Erro ao carregar produtos. Verifique o login.");
    window.location.href = "login.html";
  }
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

carregarProdutos();
