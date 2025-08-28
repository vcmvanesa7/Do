// src/viewsjs/course.js
// #5 Vista del curso

import { api } from "../services/api.js";
import { navigate } from "../router.js";

export function CourseView(params) {
  const section = document.createElement("section");
  section.innerHTML = `<p>Cargando curso...</p>`;
  const courseId = Number(params.id);

  (async () => {
    try {
      const { levels } = await api.get(`/levels/courses/${courseId}/levels`);
      section.innerHTML = `
        <h1>📚 Niveles del curso</h1>
        <div class="niveles-grid">
          ${levels.map(l => `
            <div class="nivel-card">
              <h3>${l.step}. ${l.name}</h3>
              <p>${l.description ?? ""}</p>
              <button class="btn" data-id="${l.id_level}">Abrir nivel</button>
            </div>
          `).join("")}
        </div>
        <p><a data-link href="/dashboard">← Volver</a></p>
      `;

      section.querySelectorAll("button[data-id]").forEach(btn => {
        btn.addEventListener("click", () => {
          navigate(`/level/${btn.dataset.id}`);
        });
      });
    } catch (err) {
      section.innerHTML = `<p>❌ Error: ${err.message}</p>`;
    }
  })();

  return section;
}