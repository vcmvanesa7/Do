// src/viewsjs/quiz.js
import { api } from "../services/api.js";
import { navigate } from "../router.js";

export function QuizView(params) {
    const section = document.createElement("section");
    section.innerHTML = `
    <div class="p-6">
      <button id="backBtn" class="mb-4 text-blue-500">← Volver al nivel</button>
      <h2 class="text-2xl font-bold mb-4">📝 Quiz</h2>
      <div id="quizContainer">Cargando quiz...</div>
    </div>
  `;

    const container = section.querySelector("#quizContainer");

    (async () => {
        try {
            // GET /quizzes/:id  (o /progress/quiz/:id si lo tienes así en el backend)
            const { data: quiz } = await api.get(`/quizzes/${params.id}`, { auth: true });
            if (!quiz) {
                container.textContent = "❌ Quiz no encontrado.";
                return;
            }

            container.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">${quiz.title}</h3>
        <form id="quizForm" class="space-y-4">
          ${quiz.questions
                    .map(
                        (q, i) => `
                <div class="border p-2 rounded">
                  <p class="font-medium">${i + 1}. ${q.question}</p>
                  ${q.options
                                .map(
                                    (opt, j) => `
                        <label class="block">
                          <input type="radio" name="q${i}" value="${opt}" class="mr-2"/>
                          ${opt}
                        </label>
                      `
                                )
                                .join("")}
                </div>
              `
                    )
                    .join("")}
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Enviar Quiz</button>
        </form>
        <pre id="result" class="mt-4 bg-gray-100 p-2 rounded"></pre>
      `;

            section.querySelector("#quizForm").addEventListener("submit", async (e) => {
                e.preventDefault();
                const answers = quiz.questions.map((_, i) => {
                    return section.querySelector(`input[name="q${i}"]:checked`)?.value || null;
                });

                try {
                    const res = await api.post(`/progress/quiz/${params.id}/submit`, { answers });
                    section.querySelector("#result").textContent = JSON.stringify(res.data, null, 2);
                } catch (err) {
                    section.querySelector("#result").textContent =
                        `❌ Error: ${err.response?.data?.error || err.message}`;
                }
            });
        } catch (err) {
            container.textContent = `❌ Error cargando quiz: ${err.message}`;
        }
    })();

    section.querySelector("#backBtn").addEventListener("click", () => {
        navigate(`/level/${params.levelId}`);
    });

    return section;
}
