// src/services/api.js
import { API_URL, TIMEOUT } from "../config.js";

async function apiRequest(path, { method = "GET", body, auth = false, headers = {} } = {}) { // Función genérica para hacer peticiones a la API
  const controller = new AbortController(); // Controlador para abortar la petición si se excede el tiempo límite
  const t = setTimeout(() => controller.abort(), TIMEOUT); // Tiempo límite para la petición
  const token = localStorage.getItem("token"); // Obtener token del almacenamiento local si es necesario

  const res = await fetch(`${API_URL}${path}`, {  // Realizar la petición
    method,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

    //Si la petición termina antes del tiempo límite, cancela el setTimeout para no abortarla innecesariamente.
  clearTimeout(t);

  if (!res.ok) { // Manejo de errores
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json(); // Asumimos que la respuesta es JSON
}


// Funciones específicas para cada método HTTP con el backend ejemplo de uso: api.get('/users')
//Esto son como atajos para que no tengas que repetir method: "POST" cada vez.
export const api = { 
  
  get: (path, opts) => apiRequest(path, { ...opts, method: "GET" }), 
  post: (path, body, opts) => apiRequest(path, { ...opts, method: "POST", body }),  
  put: (path, body, opts) => apiRequest(path, { ...opts, method: "PUT", body }), 
  delete: (path, opts) => apiRequest(path, { ...opts, method: "DELETE" }),
};

