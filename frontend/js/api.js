// api.js
const API_URL = 'http://localhost:3000/api';

export async function apiRequest(endpoint, method = 'GET', data = null, auth = true) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (auth && token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(API_URL + endpoint, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
}
