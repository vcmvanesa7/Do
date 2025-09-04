// frontend/src/viewsjs/register.js
// #2 Vista de registro
// Exporta una función que retorna el HTML de la vista de registro
// Contiene un formulario básico de registro

import { navigate } from "../router.js";
import { api } from "../services/api.js";

export function RegisterView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <div class="max-w-xl" style="margin: 0 auto;">
      <h1>Registro</h1>
      <form id="registerForm">
        <input type="text"  name="name" placeholder="Usuario" required>
        <input type="email"  name="email" placeholder="Correo electrónico" required>
        <input type="password"  name="password" placeholder="Contraseña" required>
        <button type="submit" class="btn">Registrarme</button>
      </form>
      <div class="container_Gologin" >
        <p>Are you already registered?</p>
        <a data-link href="/login" class="underline">Login</a>
      </div>
    </div>
  `;

  // Lógica del formulario
  section.querySelector("#registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = {
      nombre: form.querySelector('input[name="name"]').value.trim(),
      email: form.querySelector('input[name="email"]').value.trim(),
      password: form.querySelector('input[name="password"]').value,
    };
    try {
      await api.post("/auth/register", payload, { auth: false });
      alert("✅ Registro exitoso, inicia sesión");
      navigate("/login");
    } catch (err) {
      alert("❌ " + err.message);
    }
  });

  return section;
}
