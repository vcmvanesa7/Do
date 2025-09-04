// src/viewsjs/level.js
import { navigate } from "../router.js";
import { api } from "../services/api.js";

export function LevelView(params) {
  const section = document.createElement("section");
  section.className = "container";
  section.innerHTML = `<p>Cargando nivel...</p>`;

  const nivelId = Number(params.id);
  let state = {
    level: null,
    theories: [],
    quizzes: [],
    exercises: [],
    percent: 0
  };

  async function load() {
    try {
      const data = await api.get(`/progress/level/${nivelId}`, { auth: true });
      state = { ...state, ...data };

      console.log(data)
      render();
    } catch (err) {
      section.innerHTML = `<p>❌ Error cargando nivel: ${err.message}</p>`;
    }
  }

  function nextPending() {
    // Orden deseado: Teoría → Quiz → Ejercicio
    const t = state.theories.find(x => !x.completed);
    if (t) return { type: "theory", item: t };
    const q = state.quizzes.find(x => !x.completed);
    if (q) return { type: "quiz", item: q };
    const e = state.exercises.find(x => !x.completed);
    if (e) return { type: "exercise", item: e };
    return null;
  }

  function render() {
    section.innerHTML = `
      <h2>${state.level?.name || "Nivel"}</h2>
      <p>${state.level?.description || ""}</p>
      <p><strong>Progreso:</strong> ${state.percent}%</p>

      <hr/>
      <h3>Teoría</h3>
      <ul>
        ${state.theories.map(t => `
          <li style="margin-bottom: 12px;">
            <strong>${t.name}</strong>
            ${t.completed ? " ✅" : ""}
            <div style="margin-top:6px;">
              <button class="btn" data-action="viewTheory" data-id="${t.id_theory}">Ver</button>
              ${t.completed ? "" : `<button class="btn" data-action="completeTheory" data-id="${t.id_theory}">Marcar como completada</button>`}
            </div>
          </li>
        `).join("")}
      </ul>

      <h3>Quizzes</h3>
      <ul>
        ${state.quizzes.map(q => `
          <li style="margin-bottom: 12px;">
            <strong>${q.name}</strong> (${q.type}) ${q.completed ? " ✅" : ""}
            <div style="margin-top:6px;">
              <button class="btn" data-action="openQuiz" data-id="${q.id}">Ir al quiz</button>
            </div>
          </li>
        `).join("")}
      </ul>

      <h3>Ejercicios</h3>
      <ul>
        ${state.exercises.map(e => `
          <li style="margin-bottom: 12px;">
            <strong>${e.title}</strong> — ${e.difficulty} ${e.completed ? " ✅" : ""}
            <div style="margin-top:6px;">
              <button class="btn" data-action="openExercise" data-id="${e.id_exercise}">Resolver ejercicio</button>
            </div>
          </li>
        `).join("")}
      </ul>

      <div style="margin-top:16px;">
        <button class="btn" id="nextBtn">Siguiente ▶</button>
      </div>

      <!-- Modal simple para teoría -->
      <dialog id="theoryModal">
        <article>
          <header>
            <h3 id="theoryTitle"></h3>
            <button id="closeTheory" aria-label="Close">✖</button>
          </header>
          <div id="theoryBody" style="white-space: pre-wrap;"></div>
        </article>
      </dialog>
    `;

    // Botones teoría
    section.querySelectorAll("[data-action='viewTheory']").forEach(btn => {
      btn.addEventListener("click", () => openTheory(Number(btn.dataset.id)));
    });

    section.querySelectorAll("[data-action='completeTheory']").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id_theory = Number(btn.dataset.id);
        await api.post("/progress/theory/complete", { id_level: nivelId, id_theory }, { auth: true });
        await load();
      });
    });

    // Quiz/Ejercicio
    section.querySelectorAll("[data-action='openQuiz']").forEach(btn => {
      btn.addEventListener("click", () => navigate(`/quiz/${Number(btn.dataset.id)}`));
    });
    section.querySelectorAll("[data-action='openExercise']").forEach(btn => {
      btn.addEventListener("click", () => navigate(`/exercise/${Number(btn.dataset.id)}`));
    });

    // Siguiente
    section.querySelector("#nextBtn").addEventListener("click", async () => {
      const nxt = nextPending();
      if (!nxt) {
        // nada pendiente → validar fin de nivel
        const resp = await api.post("/progress/level/check", { id_level: nivelId }, { auth: true });
        alert(resp.message || "Nivel validado");

        console.log(state)

        if (state.level.id_next_level) {
          navigate(`/level/${state.level.id_next_level}`);
        } else if (state.level.id_courses) {
          navigate(`/course/${state.level.id_courses}`);
        } else {
          navigate('/dashboard');
        }

        return;
      }
      if (nxt.type === "theory") {
        openTheory(nxt.item.id_theory);
      } else if (nxt.type === "quiz") {
        navigate(`/quiz/${nxt.item.id}`);
      } else {
        navigate(`/exercise/${nxt.item.id_exercise}`);
      }
    });
  }

  async function openTheory(id_theory) {
    // Los datos ya vienen en state.theories
    const t = state.theories.find(x => x.id_theory === id_theory);
    if (!t) return;
    const dlg = section.querySelector("#theoryModal");
    section.querySelector("#theoryTitle").textContent = t.name;
    section.querySelector("#theoryBody").textContent = t.content;
    dlg.showModal();

    section.querySelector("#closeTheory").onclick = () => dlg.close();
  }

  load();
  return section;
}
