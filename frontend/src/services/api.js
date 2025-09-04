<<<<<<< HEAD
// src/services/api.js
import { API_URL, TIMEOUT } from "../config.js";

async function apiRequest(path, { method = "GET", body, auth = false, headers = {} } = {}) { // Función genérica para hacer peticiones a la API
  const controller = new AbortController(); // Controlador para abortar la petición si se excede el tiempo límite
  const t = setTimeout(() => controller.abort(), TIMEOUT); // Tiempo límite para la petición

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(t);

    // No content
    if (res.status === 204) return null;

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      // backend suele devolver { error: '...' } o { errors: [...] }
      const msg = data && (data.error || (data.errors && data.errors[0]) || JSON.stringify(data)) || res.statusText;
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    clearTimeout(t);
    // Re-lanza para que la UI lo capture
    throw err;
  }
}



// Funciones específicas para cada método HTTP con el backend ejemplo de uso: api.get('/users')
//Esto son como atajos para que no tengas que repetir method: "POST" cada vez.
export const api = {

  get: (path, opts) => apiRequest(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiRequest(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: "DELETE" }),
};

=======
// src/services/api.js
import { API_URL, TIMEOUT } from "../config.js";

async function apiRequest(path, { method = "GET", body, auth = false, headers = {} } = {}) { // Función genérica para hacer peticiones a la API
  const controller = new AbortController(); // Controlador para abortar la petición si se excede el tiempo límite
  const t = setTimeout(() => controller.abort(), TIMEOUT); // Tiempo límite para la petición

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(t);

    // No content
    if (res.status === 204) return null;

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      // backend suele devolver { error: '...' } o { errors: [...] }
      const msg = data && (data.error || (data.errors && data.errors[0]) || JSON.stringify(data)) || res.statusText;
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    clearTimeout(t);
    // Re-lanza para que la UI lo capture
    throw err;
  }
}



// Funciones específicas para cada método HTTP con el backend ejemplo de uso: api.get('/users')
//Esto son como atajos para que no tengas que repetir method: "POST" cada vez.
export const api = {
  get: (path, opts) => apiRequest(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiRequest(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: "DELETE" }),
};

>>>>>>> Juanda
export {apiRequest};