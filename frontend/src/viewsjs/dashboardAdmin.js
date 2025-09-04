import { CoursesAdminView } from "./CoursesAdminView.js";
import { LevelsAdminView } from "./LevelsAdminView.js";

export function DashboardAdminView() {
  const section = document.createElement("section");
  section.classList.add('admin-dashboard');

  section.innerHTML = `
    <nav class="admin-sidebar">
      <div class="sidebar-logo">
          <h2>Admin</h2>
      </div>
      <ul>
        <div>
          <li><a href="#courses" data-module="courses">Cursos</a></li>  
          <li><a href="#levels" data-module="levels">Niveles</a></li>
        </div>
        <button id="logout-button" class="logout-button">Cerrar sesión</button>
      </ul>
    </nav>
    <main id="admin-content" class="admin-content">
      <div>
        <h2>Bienvenido al Dashboard</h2>
        <p>Selecciona una opción del menú lateral para empezar.</p>
      </div>
    </main>
  `;

  const adminContent = section.querySelector("#admin-content");
  const links = section.querySelectorAll("a[data-module]");

  // Función para renderizar según hash
  function renderModuleFromHash() {
    const hash = window.location.hash.replace("#", "");
    if (hash === "courses") {
      CoursesAdminView(adminContent)
    } else if (hash === "levels") {
      LevelsAdminView(adminContent)
    } else {
      adminContent.innerHTML = `
        <h2>Bienvenido al Dashboard</h2>
        <p>Selecciona una opción del menú lateral para empezar.</p>
      `;
    }

    const logoutButton = section.querySelector("#logout-button");
    logoutButton.addEventListener("click", () => {
    // Aquí puedes eliminar tokens, limpiar el estado, etc.
    // Por ejemplo:
      localStorage.removeItem("token");
      window.location.href = "/"; // o redirigir al login
    });

    // Opcional: resaltar pestaña activa
    links.forEach(link => {
      link.classList.toggle("active", link.getAttribute("data-module") === hash);
    });

    // Opcional: resaltar pestaña activa
    links.forEach(link => {
      link.classList.toggle("active", link.getAttribute("data-module") === hash);
    });
  }

  // Al hacer clic en un link, actualiza hash
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const module = link.getAttribute("data-module");
      window.location.hash = module; // esto dispara hashchange
    });
  });

  // Escuchar cambios en hash
  window.addEventListener("hashchange", renderModuleFromHash);
  renderModuleFromHash(); // render inicial según hash actual

  return section;
}