// src/viewsjs/dashboard.js
// #4 Vista del dashboard
// Exporta una función que retorna el HTML de la vista del dashboard
// Contiene enlaces a cursos disponibles    

import { api } from "../services/api.js";

export function DashboardView() {
  const section = document.createElement("section");
  section.innerHTML = `<h1>Dashboard</h1><p>Cargando cursos...</p>`;

  (async () => {
    try {
      // 🔹 Traemos el perfil primero (solo añadimos esto)
      let profile = null;
      try {
        profile = await api.get("/api/user/profile", { auth: true });
      } catch (err) {
        console.warn("No se pudo cargar el perfil:", err.message);
      }

      // BACKEND: GET /courses  -> devuelve array de cursos
      const response = await api.get("/courses", { auth: true });
      console.log("respuesta /courses:", response);

      // aseguramos que sea array
      const courses = Array.isArray(response) ? response : response.courses || [];

      // 🎨 Pintamos stats si existen, y cursos siempre
      section.innerHTML = `
        <h1>Dashboard</h1>

        ${profile ? `
          <div class="user-stats">
            <span>🌟 XP total: ${profile?.xp_total ?? 0}</span>
            <span>💰 Coins: ${profile?.coins ?? 0}</span>
          </div>
        ` : ""}


        <div class="courses-grid">
          ${courses
          .map(
            (c) => `
              <div class="curso-card">
                <h2>${c.name}</h2>
                <p>${c.description ?? ""}</p>
                <a data-link class="btn" href="/course/${c.id_courses}">Entrar</a>
              </div>
            `
          )
          .join("")}
        </div>
      `;
    } catch (err) {
      section.innerHTML = `<p>❌ No se pudieron cargar los cursos: ${err.message}</p>`;
    }
  })();

  return section;
}
