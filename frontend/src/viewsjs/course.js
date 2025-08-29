
// src/viewsjs/course.js
import { api } from "../services/api.js";
import { navigate } from "../router.js";

export function CourseView(params) {
  const section = document.createElement("section");
  section.innerHTML = `<p>Cargando curso...</p>`;
  const courseId = Number(params.id);

  (async () => {
    try {
      // BACKEND: GET /levels/course/:id_course -> devuelve array de levels
      const levels = await api.get(`/levels/course/${courseId}`);

      section.innerHTML = `
        <h1>📚 Niveles del curso</h1>
        <div class="levels-list">
          ${levels
          .map(
            (l) => `
            <div class="level-card">
              <h3>${l.name}</h3>
              <p>${l.description ?? ""}</p>
              <button data-id="${l.id_level}" class="btn">Entrar</button>
            </div>
          `
          )
          .join("")}
        </div>
        <p><a data-link href="/dashboard">← Volver</a></p>
      `;

      // listeners botones entrar
      section.querySelectorAll("button[data-id]").forEach((btn) => {
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
