// src/viewsjs/dashboard.js
// #4 Vista del dashboard
// Exporta una función que retorna el HTML de la vista del dashboard
// Contiene enlaces a cursos disponibles    

// src/views/dashboard.js
export function DashboardView() {
  const section = document.createElement("section");

  // Cursos simulados
  const cursos = [
    { id: 1, nombre: "Curso de HTML", progreso: 60 },
    { id: 2, nombre: "Curso de CSS", progreso: 30 },
    { id: 3, nombre: "Curso de JavaScript", progreso: 10 },
  ];

  section.innerHTML = `
    <h1>🎮 Bienvenido a tu Aventura</h1>
    <p>Selecciona un curso para continuar tu misión:</p>
    <div class="cursos-grid">
      ${cursos.map(c => `
        <div class="curso-card">
          <h2>${c.nombre}</h2>
          <div class="progress-bar">
            <div class="progress" style="width:${c.progreso}%"></div>
          </div>
          <a data-link href="/course/${c.id}" class="btn">Entrar</a>
        </div>
      `).join("")}
    </div>
  `;

  return section;
}
