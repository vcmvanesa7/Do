// src/viewsjs/dashboard.js
// #4 Vista del dashboard
// Exporta una función que retorna el HTML de la vista del dashboard
// Contiene enlaces a cursos disponibles    

import { api } from "../services/api.js";

// src/views/dashboard.js
export function DashboardView() {
  const section = document.createElement("section");
  section.innerHTML = `<h1>Dashboard</h1><p>Cargando cursos...</p>`;

  (async () => {
    try {
      const courses = await api.get("/levels/courses");
      section.innerHTML = `
        <h1>🏁 Tus cursos</h1>
        <div class="cursos-grid">
          ${courses.map(c => `
            <div class="curso-card">
              <h2>${c.name}</h2>
              <p>${c.description ?? ""}</p>
              <a data-link class="btn" href="/course/${c.id_courses}">Entrar</a>
            </div>
          `).join("")}
        </div>
      `;
    } catch (err) {
      section.innerHTML = `<p>❌ No se pudieron cargar los cursos: ${err.message}</p>`;
    }
  })();

  return section;
}