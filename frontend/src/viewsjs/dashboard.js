// src/viewsjs/dashboard.js
// #4 Vista del dashboard
// Exporta una función que retorna el HTML de la vista del dashboard
// Contiene enlaces a cursos disponibles    

import { navigate } from "../router.js";

export function DashboardView() {
  const section = document.createElement("section");

  // Simulamos algunos cursos
  const cursos = [
    { id: 1, nombre: "Curso de JavaScript" },
    { id: 2, nombre: "Curso de HTML y CSS" },
    { id: 3, nombre: "Curso de Python" },
  ];

  // Generar HTML de la lista de cursos
  const cursosHTML = cursos
    .map(
      (curso) => `
      <div class="curso">
        <h3>${curso.nombre}</h3>
        <button class="btn" data-id="${curso.id}">Ver Curso</button>
      </div>
    `
    )
    .join("");

  section.innerHTML = `
    <h1>Dashboard</h1>
    <p>Lista de cursos disponibles:</p>
    <div class="cursos">${cursosHTML}</div>
  `;

  // Lógica de los botones para cada curso
  const botones = section.querySelectorAll(".curso button");
  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      navigate(`/course/${id}`); // Redirige a Course/:id
    });
  });

  return section;
}
