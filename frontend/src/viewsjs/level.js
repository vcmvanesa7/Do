// src/viewsjs/level.js
import { navigate } from "../router.js";

export function LevelView(params) {
  const section = document.createElement("section");
  section.innerHTML = `<p>Cargando nivel...</p>`; // estado inicial

  const nivelId = params.id;

  async function fetchLevelData() {
    try {
      // 👇 ajusta la URL según tu backend
      const res = await fetch(`http://localhost:4000/levels/${nivelId}`);
      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const data = await res.json();
      // data podría ser algo como:
      // { id_level: 1, name: "Nivel 1", theory: "...", exercises: ["Ej 1", "Ej 2"] }

      renderLevel(data);
    } catch (err) {
      console.error("Error al cargar el nivel:", err);
      section.innerHTML = `<p>Error al cargar nivel. Intenta más tarde.</p>`;
    }
  }

  function renderLevel(data) {
    const ejerciciosHTML = (data.exercises || [])
      .map((e) => `<li>${e}</li>`)
      .join("");

    section.innerHTML = `
      <h1>${data.name || "Nivel " + nivelId}</h1>
      <h3>Teoría</h3>
      <p>${data.theory || "Contenido no disponible"}</p>
      <h3>Ejercicios</h3>
      <ul>${ejerciciosHTML}</ul>

      <a data-link href="/course/${data.courseId}" class="btn">Volver al Curso</a>
      <a data-link href="/dashboard" class="btn">Volver al Dashboard</a>
    `;
  }

  // cargar del back
  fetchLevelData();

  return section;
}
