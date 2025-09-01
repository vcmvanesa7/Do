// src/components/navbar.js
import { navigate } from "../router.js";

export function Navbar() {
  const nav = document.createElement("nav");
  nav.classList.add("sidebar");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const nombre = user.name || user.nombre || user.email || "Invitado";
  const saved = localStorage.getItem(`avatar_${user.id}`) || "/avatar/avatar_robot_2.png";

  nav.innerHTML = `
  <div class="sidebar-logo">🚀 ${nombre}</div>
  <div class="sidebar-user">
    <img id="sidebarAvatar" class="sidebar-avatar" alt="Avatar usuario">
  </div>
  <ul class="sidebar-links">
    <li><a data-link href="/dashboard">🏠 Dashboard</a></li>
    <li><a data-link href="/profile">👤 Perfil</a></li>
    <li><a id="logoutBtn" href="#">🚪 Salir</a></li>
  </ul>

  <!-- Botón exportar progreso -->
  <div class="sidebar-export">
    <button id="exportProgressBtn">
      <svg class="github-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 .5C5.65.5.5 5.64.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.18-.02-2.14-3.2.7-3.88-1.54-3.88-1.54-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.67 1.23 3.32.94.1-.73.4-1.23.72-1.51-2.55-.29-5.23-1.27-5.23-5.65 0-1.25.44-2.27 1.17-3.07-.12-.29-.51-1.45.11-3.02 0 0 .95-.31 3.12 1.17a10.88 10.88 0 012.84-.38c.96.01 1.92.13 2.83.38 2.17-1.48 3.12-1.17 3.12-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.07 0 4.39-2.69 5.36-5.25 5.64.41.36.77 1.08.77 2.18 0 1.57-.01 2.84-.01 3.23 0 .3.21.65.79.54C20.71 21.38 24 17.08 24 12c0-6.36-5.15-11.5-12-11.5z"/>
      </svg>
      Exportar progreso
    </button>
  </div>
`;



  const sideImg = nav.querySelector("#sidebarAvatar");
  if (sideImg && saved) {
    sideImg.src = saved;
  }

  // Botón Exportar progreso → Iniciar sesión en GitHub
  const exportBtn = nav.querySelector("#exportProgressBtn");
  exportBtn.addEventListener("click", () => {
    // Abrir GitHub en nueva pestaña
    window.open("https://github.com/login", "_blank");
  });


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

  // Escuchar cambios de avatar
  window.addEventListener("avatarChanged", () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const saved = localStorage.getItem(`avatar_${user.id}`) || "/avatar/avatar_robot_2.png";
    const sideImg = document.querySelector("#sidebarAvatar");
    if (sideImg) sideImg.src = saved;
  });

  return nav;
}

