// #3 Vista de login
// Exporta una función que retorna el HTML de la vista de login
// Contiene un formulario básico de login

import { navigate } from "../router.js";

export function LoginView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <h1>Iniciar Sesión</h1>
    <form id="loginForm">
      <input type="email" placeholder="Correo electrónico" required>
      <input type="password" placeholder="Contraseña" required>
      <button type="submit" class="btn">Entrar</button>
    </form>
    <p>¿No tienes cuenta? 
      <a data-link href="/register" class="btn">Regístrate</a>
    </p>
  `;

  // Lógica del formulario
  const loginForm = section.querySelector("#loginForm");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm.querySelector("input[type='email']").value;
    const password = loginForm.querySelector("input[type='password']").value;

    if (email && password) {
      alert(`✅ Bienvenido ${email}`);
      navigate("/dashboard"); // redirige tras login
    } else {
      alert("⚠️ Ingresa tus credenciales");
    }
  });

  return section;
}
