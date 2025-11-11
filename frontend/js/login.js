import { api } from './api.js';
const form = document.querySelector('#login-form');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = form.email.value.trim();
  const senha = form.senha.value;
  try {
    const data = await api('/auth/login', { method:'POST', body:{ email, senha }});
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    location.href = './index.html';
  } catch (err) { alert(err.message); }
});
