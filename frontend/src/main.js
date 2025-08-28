// src/main.js
import { Navbar } from "./components/navbar.js";
import { navigate, renderRoute } from "./router.js";

function setupNavigation() {
  // Captura clicks en <a data-link>
  document.body.addEventListener("click", (e) => {
    if (e.target.tagName === "A" && e.target.hasAttribute("data-link")) {
      e.preventDefault();
      const path = e.target.getAttribute("href");
      navigate(path);
      renderRoute(path);
    }
  });
}

// Inicializar app
document.addEventListener("DOMContentLoaded", () => {

  // Crear contenedor para las vistas
  const root = document.getElementById("app");
  const container = document.createElement("div");
  container.classList.add("view-container");
  root.appendChild(container);

  setupNavigation();

  // Render inicial según la URL
  renderRoute(window.location.pathname);
});

// Manejar atrás/adelante del navegador
window.addEventListener("popstate", () => {
  renderRoute(window.location.pathname);
});
