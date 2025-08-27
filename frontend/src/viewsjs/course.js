// src/viewsjs/course.js
// #5 Vista del curso
// Exporta una función que retorna el HTML de la vista del curso
// Contiene detalles del curso y enlaces a niveles

import { navigate } from "../router.js";

export function CourseView(params) {
  const section = document.createElement("section");

  // Obtenemos el id del curso desde params
  const cursoId = params.id;

  // Simulamos niveles del curso
  const niveles = [
    { id: 1, nombre: "Nivel 1: Introducción" },
    { id: 2, nombre: "Nivel 2: Intermedio" },
    { id: 3, nombre: "Nivel 3: Avanzado" },
  ];

  // Generar HTML de los niveles
  const nivelesHTML = niveles
    .map(
      (nivel) => `
      <div class="nivel">
        <h3>${nivel.nombre}</h3>
        <button class="btn" data-id="${nivel.id}">Ver Nivel</button>
      </div>
    `
    )
    .join("");

  section.innerHTML = `
    <h1>Curso ${cursoId}</h1>
    <p>Selecciona un nivel para continuar:</p>
    <div class="niveles">${nivelesHTML}</div>
    <a data-link href="/dashboard" class="btn">Volver al Dashboard</a>
  `;

  // Lógica de los botones de nivel
  const botones = section.querySelectorAll(".nivel button");
  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nivelId = btn.getAttribute("data-id");
      navigate(`/level/${nivelId}`); // Redirige a Level/:id
    });
  });

  return section;
}
