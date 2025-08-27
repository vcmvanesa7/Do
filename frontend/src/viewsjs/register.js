// frontend/src/viewsjs/register.js
// #2 Vista de registro
// Exporta una función que retorna el HTML de la vista de registro
// Contiene un formulario básico de registro 

import { navigate } from "../router.js";

export function RegisterView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <h1>Registro</h1>
    <form id="registerForm">
      <input type="text" placeholder="Usuario" required>
      <input type="email" placeholder="Correo electrónico" required>
      <input type="password" placeholder="Contraseña" required>
      <button type="submit" class="btn">Registrarme</button>
    </form>
    <p>¿Ya tienes cuenta? 
      <a data-link href="/login" class="btn">Ir a Login</a>
    </p>
  `;

  // Lógica del formulario
  const registerForm = section.querySelector("#registerForm");
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = registerForm.querySelector("input[type='text']").value;
    const email = registerForm.querySelector("input[type='email']").value;
    const password = registerForm.querySelector("input[type='password']").value;

    if (user && email && password) {
      alert(`✅ Usuario ${user} registrado con éxito`);
      navigate("/login"); // redirige al login
    } else {
      alert("⚠️ Completa todos los campos");
    }
  });

  return section;
}
