// #3 Vista de login
// Exporta una función que retorna el HTML de la vista de login
// Contiene un formulario básico de login

import { navigate } from "../router.js";
import { api } from "../services/api.js";

export function LoginView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <h1>Iniciar Sesión</h1>
    <form id="loginForm">
      <input type="email"  name="email" placeholder="Correo electrónico" required>
      <input type="password" name="password" placeholder="Contraseña" required>
      <button type="submit" class="btn">Log In</button>
    </form>
    <p>¿No tienes cuenta? 
      <a data-link href="/register" class="btn">Regístrate</a>
    </p>
  `;

  // Lógica del formulario

  section.querySelector("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = { 
      email: form.querySelector('input[name="email"]').value.trim(),
      password: form.querySelector('input[name="password"]').value,
    };
    try {
      const { token, user } = await api.post("/auth/login", payload, { auth: false });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      alert("❌ " + err.message);
    }
  });

  return section;
}
