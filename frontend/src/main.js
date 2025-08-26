// src/main.js
import { navigate, renderRoute } from "./router.js";


function setupNavigation() {  //Captura los clicks en <a data-link> para que no hagan reload, sino que llamen a navigate().
  document.body.addEventListener("click", (e) => {
    // Si el click viene de un <a>
    if (e.target.tagName === "A" && e.target.hasAttribute("data-link")) {   // data-link es un marcador interno para diferenciar qué enlaces maneja tu router SPA y cuáles son externos que debe abrir el navegador normalmente.
      e.preventDefault();
      const path = e.target.getAttribute("href");
      navigate(path);  //Cambia la URL con pushState y renderiza la vista.
      renderRoute(path); // Renderiza la nueva ruta correspondiente
    }
  });
}

// Inicializar app
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  renderRoute(window.location.pathname); // Renderiza lo que corresponda cuando la app carga.
});

// Maneja los botones atrás/adelante del navegador
window.addEventListener("popstate", () => {
  renderRoute(window.location.pathname);
});