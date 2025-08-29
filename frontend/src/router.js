// src/router.js 
import { PublicView } from "./viewsjs/public.js";
import { RegisterView } from "./viewsjs/register.js";
import { LoginView } from "./viewsjs/login.js";
import { DashboardView } from "./viewsjs/dashboard.js";
import { CourseView } from "./viewsjs/course.js";
import { LevelView } from "./viewsjs/level.js";
import { ProfileView } from "./viewsjs/profile.js";
import { Navbar } from "./components/navbar.js";

//  Funciones helper para autenticación y roles
// ==========================================================
function isAuthenticated() {
  return !!localStorage.getItem("token"); // devuelve true si existe token
}

function getUserRole() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.role || null; // devuelve rol del usuario o null
}

// Definimos las rutas de la aplicación
// Ahora cada ruta puede tener metadata: auth y role
// ==========================================================
const routes = {
  "/": { view: PublicView, auth: false },
  "/register": { view: RegisterView, auth: false },
  "/login": { view: LoginView, auth: false },
  "/dashboard": { view: DashboardView, auth: true }, // requiere login
  "/course/:id": { view: CourseView, auth: true },
  "/level/:id": { view: LevelView, auth: true },
  "/profile": { view: ProfileView, auth: true },
  // Ejemplo de ruta protegida solo para admins:
  // "/admin": { view: AdminView, auth: true, role: "admin" }
};

//  Renderiza según la ruta
// ==========================================================
export function renderRoute(path) {
  const app = document.getElementById("app");
  let route = routes[path];
  let params = {};

  // Manejo de rutas dinámicas (ej: /course/:id)
  // --------------------------------------------
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

  // Fallback: si no hay ruta, ir al PublicView
  // --------------------------------------------
  if (!route) {
    route = { view: PublicView, auth: false };
  }


  //  Protecciones de autenticación y roles
  // --------------------------------------------
  if (route.auth && !isAuthenticated()) {
    // Si la ruta requiere login y no hay token → mandar al login
    return navigate("/login");
  }

  if (route.role && route.role !== getUserRole()) {
    // Si la ruta requiere rol y no coincide → mandar al dashboard
    return navigate("/dashboard");
  }


  // Renderizar la vista
  // --------------------------------------------
  app.innerHTML = ""; // limpia contenedor

  // Navbar solo para rutas privadas
  const privatePaths = ["/dashboard", "/profile"];
  if (
    (route.auth && !route.role) || // cualquier ruta privada sin rol especial
    privatePaths.includes(path) || // lista fija
    path.startsWith("/course/") || // dinámicas
    path.startsWith("/level/")
  ) {
    app.appendChild(Navbar()); // agrega la navbar
  }

  app.appendChild(route.view(params)); // agrega el HTMLElement devuelto
}


//  Navegación SPA sin recargar
// ==========================================================
export function navigate(path) {
  window.history.pushState({}, "", path); // cambia URL sin recargar
  renderRoute(path); // Renderiza la nueva ruta correspondiente
}

// Detectar atrás/adelante en navegador
window.onpopstate = () => renderRoute(window.location.pathname);

// Inicializar en la ruta actual
renderRoute(window.location.pathname);
