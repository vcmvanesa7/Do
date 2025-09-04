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
    percent: 0,
    sequence: [],
    currentIndex: 0
  };

  async function load() {
    try {
      const data = await api.get(`/progress/level/${nivelId}`, { auth: true });

      const sequence = [
        ...data.theories.map(t => ({ type: "theory", item: t })),
        ...data.quizzes.map(q => ({ type: "quiz", item: q })),
        ...data.exercises.map(e => ({ type: "exercise", item: e }))
      ];

      // 🔹 Buscar primer paso incompleto para reanudar
      let startIndex = sequence.findIndex(step => !step.item.completed);
      if (startIndex === -1) startIndex = sequence.length;

      state = { ...state, ...data, sequence, currentIndex: startIndex };

      render();
    } catch (err) {
      section.innerHTML = `<p>❌ Error cargando nivel: ${err.message}</p>`;
    }
  }

  function render() {
    const current = state.sequence[state.currentIndex];
    if (!current) {
      section.innerHTML = `
        <h2>${state.level?.name || "Nivel"}</h2>
        <p><strong>Progreso:</strong> 100%</p>
        <div class="progress-bar"><div class="progress" style="width:100%"></div></div>
        <p>✅ ¡Nivel completado!</p>
        <button class="btn" id="finishBtn">Finalizar nivel</button>
      `;

      section.querySelector("#finishBtn").addEventListener("click", async () => {
        const resp = await api.post("/progress/level/check", { id_level: nivelId }, { auth: true });
        alert(resp.message || "Nivel validado");

        if (state.level.id_next_level) {
          navigate(`/level/${state.level.id_next_level}`);
        } else if (state.level.id_courses) {
          navigate(`/course/${state.level.id_courses}`);
        } else {
          navigate('/dashboard');
        }
      });

      return;
    }

    // 🔹 Progreso dinámico
    const percent = Math.round((state.currentIndex / state.sequence.length) * 100);

    section.innerHTML = `
      <h2>${state.level?.name || "Nivel"}</h2>
      <p>${state.level?.description || ""}</p>
      <p><strong>Progreso:</strong> ${percent}%</p>
      <div class="progress-bar"><div class="progress" style="width:${percent}%"></div></div>

      <div class="step-card">
        ${current.type === "theory" ? `
          <h3>📖 Teoría</h3>
          <p><strong>${current.item.name}</strong></p>
          <button class="btn" id="viewTheory">Ver contenido</button>
          ${current.item.completed ? "✅" : `<button class="btn" id="completeTheory">Marcar como completada</button>`}
        ` : ""}

        ${current.type === "quiz" ? `
          <h3>📝 Quiz</h3>
          <p><strong>${current.item.name}</strong> (${current.item.type})</p>
          <!-- 🔹 pasamos el id_level en la ruta -->
          <button class="btn" id="openQuiz">Ir al quiz</button>
        ` : ""}

        ${current.type === "exercise" ? `
          <h3>💻 Ejercicio</h3>
          <p><strong>${current.item.title}</strong> — ${current.item.difficulty}</p>
          <button class="btn" id="openExercise">Resolver ejercicio</button>
        ` : ""}
      </div>

      <div style="margin-top:16px;">
        <button class="btn" id="nextBtn">Siguiente ▶</button>
      </div>

      <!-- Modal teoría -->
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

    // Eventos
    if (current.type === "theory") {
      section.querySelector("#viewTheory").addEventListener("click", () => openTheory(current.item.id_theory));
      const btn = section.querySelector("#completeTheory");
      if (btn) {
        btn.addEventListener("click", async () => {
          await api.post("/progress/theory/complete", { id_level: nivelId, id_theory: current.item.id_theory }, { auth: true });
          current.item.completed = true;
          render();
        });
      }
    }
    if (current.type === "quiz") {
      // 🔹 pasamos id_level en query param
      section.querySelector("#openQuiz").addEventListener("click", () => navigate(`/quiz/${current.item.id}?level=${nivelId}`));
    }
    if (current.type === "exercise") {
      section.querySelector("#openExercise").addEventListener("click", () => navigate(`/exercise/${current.item.id_exercise}`));
    }

    section.querySelector("#nextBtn").addEventListener("click", () => {
      state.currentIndex++;
      render();
    });
  }

  async function openTheory(id_theory) {
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
