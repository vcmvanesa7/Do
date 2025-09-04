// src/viewsjs/login.js

import { navigate } from "../router.js";
import { apiRequest } from "../services/api.js";

export function LoginView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <div class="max-w-xl" style="margin: 0 auto;">
      <h1>Iniciar Sesión</h1>
      <form id="loginForm" class="!mb-2">
        <input type="email" name="email" placeholder="Correo electrónico" required>
        <input type="password" name="password" placeholder="Contraseña" required>
        <button type="submit" class="btn">Iniciar sesión</button>
      </form>
      <button id="githubLoginBtn" class="btn">Iniciar sesión con GitHub</button>
      <div class="container_Gologin" >
        <p>You don't have an account</p>
        <p><a data-link class="underline" href="/register">Register</a></p>
      </div>
    </div>
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
      // Enviar el formulario de login
      const { token, user } = await apiRequest("/auth/login", {
        method: "POST",
        body: payload,
        auth: false });

      // Guardar el token y los datos del usuario en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirigir a la vista correspondiente según el rol del usuario
      if (user.role === "admin") {
        navigate("/dashboardAdmin"); // Redirige a dashboardAdmin si es admin
      } else {
        navigate("/dashboard"); // Redirige a dashboard normal si es un usuario normal
      }
    } catch (err) {
      // En caso de error, mostrar mensaje
      alert("❌ " + err.message);
    }
  });

   // Lógica del botón GitHub
  section.querySelector("#githubLoginBtn").addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost:3001/auth/github");
      const data = await res.json();
      window.location.href = data.url; // Redirige a GitHub
    } catch (err) {
      alert("❌ Error iniciando sesión con GitHub");
    }
  });

  return section;
}