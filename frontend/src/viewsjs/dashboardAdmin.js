import { CoursesAdminView } from "./CoursesAdminView.js";
import { LevelsAdminView } from "./LevelsAdminView.js";

export function DashboardAdminView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <div class="sidebar-logo">
      <nav class="admin-sidebar">
        <h2>Admin</h2>
        <ul>
          <li><a href="#courses" data-module="courses">Cursos</a></li>  
          <li><a href="#levels" data-module="levels">Niveles</a></li>
        </ul>
      </nav>
      <main id="admin-content" class="admin-content">
        <h2>Bienvenido al Dashboard</h2>
        <p>Selecciona una opción del menú lateral para empezar.</p>
      </main>
    </div>
  `;

  const adminContent = section.querySelector("#admin-content");
  const links = section.querySelectorAll("a[data-module]");

  // Función para renderizar según hash
  function renderModuleFromHash() {
    const hash = window.location.hash.replace("#", "");
    if (hash === "courses") CoursesAdminView(adminContent);
    else if (hash === "levels") LevelsAdminView(adminContent);
    else {
      adminContent.innerHTML = `
        <h2>Bienvenido al Dashboard</h2>
        <p>Selecciona una opción del menú lateral para empezar.</p>
      `;
    }

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