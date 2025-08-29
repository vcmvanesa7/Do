// src/router.js
import { PublicView } from "./viewsjs/public.js";
import { RegisterView } from "./viewsjs/register.js";
import { LoginView } from "./viewsjs/login.js";
import { DashboardView } from "./viewsjs/dashboard.js";
import { CourseView } from "./viewsjs/course.js";
import { LevelView } from "./viewsjs/level.js";
import { ProfileView } from "./viewsjs/profile.js";
import { Navbar } from "./components/navbar.js"; 

// Definimos las rutas
const routes = {
  "/": PublicView,
  "/register": RegisterView,
  "/login": LoginView,
  "/dashboard": DashboardView,
  "/course/:id": CourseView,
  "/level/:id": LevelView,
  "/profile": ProfileView,
};


// Renderiza según la ruta
export function renderRoute(path) {  // path es un parámetro que recibo al llamar la función
  const app = document.getElementById("app");
  let route = routes[path];
  let params = {};

  // Manejo de rutas dinámicas
  if (!route) {
    const pathParts = path.split("/");
    for (const routePath in routes) {
      const routeParts = routePath.split("/");
      if (routeParts.length === pathParts.length) {
        let match = true;
        params = {};
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(":")) {
            const paramName = routeParts[i].substring(1);
            params[paramName] = pathParts[i];
          } else if (routeParts[i] !== pathParts[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          route = routes[routePath];
          break;
        }
      }
    }
  }

  // Fallback
  if (!route) {
    route = PublicView;
  }

  // Renderizar la vista
  app.innerHTML = "";             // limpia contenedor

const privateRoutes = ["/dashboard", "/course", "/level", "/profile"];

const isPrivate = 
privateRoutes.includes(path) ||
path.startsWith("/course/") ||
path.startsWith("/level/");

if (isPrivate) {
  app.appendChild(Navbar()); // agrega la navbar
}

  


  app.appendChild(route(params)); // agrega el HTMLElement devuelto

}

/*Función para navegar sin recargar usando history.pushState
 🔀 Función para navegar dentro de la aplicación sin recargar la página
// Recibe como parámetro `path`, que representa la nueva ruta (ej: "/login", "/about").
//
// 1. window.history.pushState({}, "", path):
//    - Agrega una nueva entrada al historial del navegador.
//    - Cambia la URL que aparece en la barra de direcciones por la indicada en `path`.
//    - Importante: NO recarga la página, solo actualiza la URL.
//
// 2. renderRoute(path):
//    - Llama a la función encargada de renderizar la vista correspondiente a la ruta.
      - Esto hace que el contenido de la SPA (Single Page Application) cambie dinámicamente.
*/

export function navigate(path) {
  window.history.pushState({}, "", path); // pushState Permite cambiar la URL que aparece en la barra de direcciones sin recargar la página.
  renderRoute(path); // Renderiza la nueva ruta correspondiente
}

// Detectar atrás/adelante
window.onpopstate = () => renderRoute(window.location.pathname);

// Inicializar en la ruta actual
renderRoute(window.location.pathname);
