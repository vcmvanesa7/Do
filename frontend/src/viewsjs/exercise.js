// src/viewsjs/exercise.js
import { navigate } from "../router.js";
import { api } from "../services/api.js";

export function ExerciseView(params) {
    const section = document.createElement("section");
    section.innerHTML = `
    <div class="p-6">
      <button id="backBtn" class="mb-4 text-blue-500">← Volver al nivel</button>
      <h2 class="text-2xl font-bold mb-4">💪 Ejercicio</h2>
      <div id="exerciseContainer">Cargando ejercicio...</div>
    </div>
  `;

    const container = section.querySelector("#exerciseContainer");

    (async () => {
        try {
            const { data: exercise } = await api.get(`/exercises/${params.id}`, { auth: true });
            if (!exercise) {
                container.textContent = "❌ Ejercicio no encontrado.";
                return;
            }

            container.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">${exercise.title}</h3>
        <p class="mb-2 text-gray-700">${exercise.description || ""}</p>
        <textarea id="codeInput" placeholder="Write your answer" class="w-full border p-2 rounded mb-4" rows="10" placeholder="Escribe tu código aquí..."></textarea>
        <button id="submitBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Enviar intento</button>
        <pre id="result" class="mt-4 bg-gray-100 p-2 rounded"></pre>
      `;

            section.querySelector("#submitBtn").addEventListener("click", async () => {
                const code = section.querySelector("#codeInput").value;
                try {
                    const res = await api.post(
                        `/progress/exercise/attempt`,
                        { code, id_exercise: params.id },
                        { auth: true }
                    );
                    section.querySelector("#result").textContent = JSON.stringify(res.data, null, 2);
                } catch (err) {
                    section.querySelector("#result").textContent =
                        `❌ Error: ${err.response?.data?.error || err.message}`;
                }
            });
        } catch (err) {
            container.textContent = `❌ Error cargando ejercicio: ${err.message}`;
        }
    })();

    section.querySelector("#backBtn").addEventListener("click", () => {

        navigate(`/level/${params.id}`);
    });

    return section;
}
