// src/viewsjs/course.js

import { api } from "../services/api.js";
import { navigate } from "../router.js";

export function CourseView(params) {
  const section = document.createElement("section");
  section.innerHTML = `<p>Cargando curso...</p>`;
  const courseId = Number(params.id);

  (async () => {
    try {
      // Pido niveles y progreso en paralelo
      const [levels, progressRaw] = await Promise.all([
        api.get(`/levels/course/${courseId}`, { auth: true }),
        api.get(`/progress/course/${courseId}`, { auth: true }),
      ]);

      // Normalizo progreso (defensivo)
      const progress = {
        percent: progressRaw?.percent ?? 0,
        levels: Array.isArray(progressRaw?.levels)
          ? progressRaw.levels
          : [],
      };

      section.innerHTML = `
        <h1>📚 Niveles del curso</h1>
        <br>
        <div class="levels-list">
          ${levels
          .map((l, idx) => {
            const userLevel = progress.levels.find(
              (pl) => pl.id_level === l.id_level
            );
            const completed = userLevel?.completed ?? false;

            // regla de desbloqueo: sólo el primer nivel o si el anterior está completo
            const prevLevel = levels[idx - 1];
            const prevCompleted =
              !prevLevel ||
              progress.levels.find((pl) => pl.id_level === prevLevel.id_level)?.completed;

            const locked = !completed && !prevCompleted;

            return `
                <div class="level-card ${completed ? "done" : locked ? "locked" : "pending"}">
                  <h3>${l.name}</h3>
                  <p>${l.description ?? ""}</p>
                  <p>
                    Estado:
                    ${completed
                ? "✅ Completado"
                : locked
                  ? "🔒 Bloqueado"
                  : "🔓 Disponible"
              }
                  </p>
                  <button data-id="${l.id_level}" class="btn" ${locked ? "disabled" : ""}>
                    ${completed ? "Revisar" : "Entrar"}
                  </button>
                </div>
              `;
          })
          .join("")}
        </div>
        <p><a data-link href="/dashboard">← Volver</a></p>
      `;

      // listeners botones
      section.querySelectorAll("button[data-id]").forEach((btn) => {
        if (!btn.disabled) {
          btn.addEventListener("click", () => {
            navigate(`/level/${btn.dataset.id}`);
          });
        }
      });
    } catch (err) {
      section.innerHTML = `<p>❌ Error: ${err.message}</p>`;
    }
  })();

  return section;
}
