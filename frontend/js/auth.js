import { apiRequest } from "./api.js";

const form = document.getElementById("loginForm");
const erro = document.getElementById("erro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  erro.textContent = "";

  try {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const data = await apiRequest("/auth/login", "POST", { email, senha }, false);
    localStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } catch (err) {
    erro.textContent = "Credenciais inválidas.";
    console.error(err);
  }
});
