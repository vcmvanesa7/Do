// src/viewsjs/login.js

import { navigate } from "../router.js";
import { apiRequest } from "../services/api.js";

export function LoginView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <h1>Iniciar Sesión</h1>
    <form id="loginForm">
      <input type="email" name="email" placeholder="Correo electrónico" required>
      <input type="password" name="password" placeholder="Contraseña" required>
      <button type="submit" class="btn">Iniciar sesión</button>
    </form>
    <div class="container_Gologin" >
    <p>You don't have an account</p>
    <p><a data-link href="/register">Register</a></p>
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

  return section;
}
