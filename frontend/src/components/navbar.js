// src/components/navbar.js
import { navigate } from "../router.js";

export function Navbar() {
  const nav = document.createElement("nav");
  nav.classList.add("sidebar");

  nav.innerHTML = `
    <div class="sidebar-logo">🚀 DevGame</div>
    <ul class="sidebar-links">
      <li><a data-link href="/dashboard">🏠 Dashboard</a></li>
      <li><a data-link href="/profile">👤 Perfil</a></li>
      <li><a id="logoutBtn" href="#">🚪 Salir</a></li>
    </ul>
  `;

  //  Logout 
  nav.querySelector("#logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();

    // Borrar toda la sesión local
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    // Redirigir al inicio (SPA)
    navigate("/"); // 🔹 usa tu router SPA → renderiza PublicView
  });

  return nav;
}
