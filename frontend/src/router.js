// src/router.js
import { Navbar } from "./components/navbar.js";
import { CourseView } from "./viewsjs/course.js";
import { DashboardView } from "./viewsjs/dashboard.js";
import { DashboardAdminView } from "./viewsjs/dashboardAdmin.js";
import { ExerciseView } from "./viewsjs/exercise.js";
import { GithubCallbackView } from "./viewsjs/githubCallback.js";
import { LevelView } from "./viewsjs/level.js";
import { LoginView } from "./viewsjs/login.js";
import { ProfileView } from "./viewsjs/profile.js";
import { PublicView } from "./viewsjs/public.js";
import { QuizView } from "./viewsjs/quiz.js";
import { RegisterView } from "./viewsjs/register.js";

// Funciones helper para autenticación y roles
function isAuthenticated() {
  return !!localStorage.getItem("token"); // Si existe el token, el usuario está autenticado
}

function getUserRole() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.role || null; // Devuelve el rol del usuario o null
}

// Rutas de la aplicación
const routes = {
  "/": { view: PublicView, auth: false },
  "/register": { view: RegisterView, auth: false },
  "/login": { view: LoginView, auth: false },
  "/dashboard": { view: DashboardView, auth: true }, // Requiere login
  "/course/:id": { view: CourseView, auth: true },
  "/level/:id": { view: LevelView, auth: true },
  "/profile": { view: ProfileView, auth: true },
  "/dashboardAdmin": { view: DashboardAdminView, auth: true, role: "admin" }, // Solo admins
  "/github/callback": GithubCallbackView,
  "/exercise/:id": { view: ExerciseView, auth: true },
  "/quiz/:id": { view: QuizView, auth: true },
};

// Renderiza la vista según la ruta
export async function renderRoute(path) {
  const app = document.getElementById("app");
  let route = routes[path];
  let params = {};

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

  if (!route) {
    route = { view: PublicView, auth: false };
  }

  // Protección de autenticación y roles
  if (route.auth && !isAuthenticated()) {
    return navigate("/login"); // Redirige al login si no está autenticado
  }

  if (route.role && route.role !== getUserRole()) {
    return navigate("/dashboard"); // Redirige al dashboard si el rol no coincide
  }

  // Renderiza la vista
  app.innerHTML = ""; // Limpia el contenedor

  // Navbar solo para rutas privadas
  const privatePaths = ["/dashboard", "/profile"];
  if (
    (route.auth && !route.role) ||
    privatePaths.includes(path) ||
    path.startsWith("/course/") ||
    path.startsWith("/level/") ||
    path.startsWith("/exercise/") ||
    path.startsWith("/quiz/")
  ) {
    app.appendChild(Navbar()); // Agrega la navbar
  }

  const view = await route.view(params);
  app.appendChild(view); // Agrega la vista correspondiente
}

// Navegación SPA sin recargar - CORREGIDO
export function navigate(path) {
  window.history.pushState({}, "", path); // Cambia la URL sin recargar
  renderRoute(path);
}

// Detectar navegación hacia atrás/adelante
window.onpopstate = () => renderRoute(window.location.pathname);

// Inicializar en la ruta actual
window.onload = () => renderRoute(window.location.pathname);