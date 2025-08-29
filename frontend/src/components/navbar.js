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
  `;


const sideImg = nav.querySelector("#sidebarAvatar");
if (sideImg && saved) {
  sideImg.src = saved;
}

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

