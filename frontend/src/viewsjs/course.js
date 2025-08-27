// src/viewsjs/course.js
// #5 Vista del curso
// Exporta una función que retorna el HTML de la vista del curso
// Contiene detalles del curso y enlaces a niveles

// src/viewsjs/course.js
import { navigate } from "../router.js";

export function CourseView(params) {
  const section = document.createElement("section");
  section.innerHTML = `<p>Cargando curso...</p>`; // loading state

  const cursoId = params.id;

  // Función para pedir datos al backend
  async function fetchCourseLevels() {
    try {
      const res = await fetch(`http://localhost:3001/courses/${cursoId}/levels?userId=1`);
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data = await res.json();

      // data tendrá: { coursesId, levels: [...], userId }
      renderLevels(data);
    } catch (err) {
      console.error("Error al obtener niveles:", err);
      section.innerHTML = `<p>Error al cargar el curso. Intenta más tarde.</p>`;
    }
  }

  // Función para renderizar los niveles
  function renderLevels(data) {
    if (!data.levels || data.levels.length === 0) {
      section.innerHTML = `
        <h1>Curso ${data.coursesId}</h1>
        <p>No hay niveles disponibles todavía.</p>
        <a data-link href="/dashboard" class="btn">Volver al Dashboard</a>
      `;
      return;
    }

    const nivelesHTML = data.levels
      .map(
        (nivel) => `
          <div class="nivel ${nivel.isUnlocked ? "" : "bloqueado"}">
            <h3>${nivel.name}</h3>
            <p>${nivel.description}</p>
            <button 
              class="btn" 
              data-id="${nivel.id_level}" 
              ${nivel.isUnlocked ? "" : "disabled"}>
              ${nivel.isUnlocked ? "Ver Nivel" : "Bloqueado 🔒"}
            </button>
          </div>
        `
      )
      .join("");

    section.innerHTML = `
      <h1>Curso ${data.coursesId}</h1>
      <p>Selecciona un nivel para continuar:</p>
      <div class="niveles">${nivelesHTML}</div>
      <a data-link href="/dashboard" class="btn">Volver al Dashboard</a>
    `;

    // Lógica de navegación
    const botones = section.querySelectorAll(".nivel button");
    botones.forEach((btn) => {
      btn.addEventListener("click", () => {
        const nivelId = btn.getAttribute("data-id");
        if (nivelId && !btn.disabled) {
          navigate(`/level/${nivelId}`);
        }
      });
    });
  }

  // Llamamos al back
  fetchCourseLevels();

  return section;
}
