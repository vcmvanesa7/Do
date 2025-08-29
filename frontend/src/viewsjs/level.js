// src/viewsjs/level.js
import { navigate } from "../router.js";
import { api } from "../services/api.js";

export function LevelView(params) {
  const section = document.createElement("section");
  section.innerHTML = `<p>Cargando nivel...</p>`; // estado inicial

  const nivelId = params.id;

  async function fetchLevelData() {
    try {
      // BACKEND: GET /levels/:id_level
      const data = await api.get(`/levels/${nivelId}`);

      section.innerHTML = `
        <h1>${data.name}</h1>
        <p>${data.description || "Contenido no disponible"}</p>
        <p><strong>Paso:</strong> ${data.step}</p>

        <h3>Teoría</h3>
        <p>La tabla 'theory' existe en tu DB, pero todavía no hay ruta pública desde el backend para obtenerla por level. Si quieres la creo (ej: GET /theory/level/:id_level).</p>

        <h3>Ejercicios / Quiz</h3>
        <p>Los endpoints de quiz/preguntas no están implementados aún en backend (actualmente /exercises es placeholder).</p>

        <a data-link href="/course/${data.id_courses}" class="btn">Volver al Curso</a>
        <a data-link href="/dashboard" class="btn">Volver al Dashboard</a>
      `;
    } catch (err) {
      section.innerHTML = `<p>❌ Error al cargar el nivel: ${err.message}</p>`;
    }
  }

  // cargar del back
  fetchLevelData();

  return section;
}
