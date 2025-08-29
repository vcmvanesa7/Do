// src/viewsjs/dashboardAdmin.js
import { api } from "../services/api.js";

export function DashboardAdminView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <div class="admin-dashboard">
      <!-- Menú lateral -->
      <nav class="admin-sidebar">
        <h2>Admin</h2>
        <ul>
          <li><a href="#" data-link data-module="courses">Cursos</a></li>
          <li><a href="#" data-link data-module="levels">Niveles</a></li>
        </ul>
      </nav>

      <!-- Contenido dinámico -->
      <main id="admin-content" class="admin-content">
        <h2>Bienvenido al Dashboard</h2>
        <p>Selecciona una opción del menú lateral para empezar.</p>
      </main>
    </div>
  `;

  const adminContent = section.querySelector("#admin-content");
  const links = section.querySelectorAll("a[data-module]");

  links.forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const module = link.getAttribute("data-module");

      // --- CURSOS ---
      if (module === "courses") {
        adminContent.innerHTML = `
          <h2>Gestionar Cursos</h2>
          <form id="course-form">
            <label>Nombre del curso:</label><br>
            <input type="text" name="name"><br><br>
            <label>Descripción:</label><br>
            <textarea name="description"></textarea><br><br>
            <button type="submit">Agregar Curso</button>
          </form>
          <ul id="course-list"></ul>
        `;

        const courseList = adminContent.querySelector("#course-list");
        const courseForm = adminContent.querySelector("#course-form");

        async function fetchCourses() {
          try {
            const data = await api.get("/courses", { auth: true });
            courseList.innerHTML = data.map(c => `
              <li>
                ${c.name} 
                <a href="#" data-edit="${c.id_course}">Editar</a> | 
                <a href="#" data-delete="${c.id_course}">Eliminar</a>
              </li>
            `).join("");
          } catch (err) {
            courseList.innerHTML = `<p>Error al cargar cursos: ${err.message}</p>`;
          }
        }

        // Agregar curso
        courseForm.addEventListener("submit", async (ev) => {
          ev.preventDefault();
          const formData = new FormData(courseForm);
          const body = {
            name: formData.get("name"),
            description: formData.get("description")
          };
          try {
            await api.post("/courses", body, { auth: true });
            courseForm.reset();
            fetchCourses();
          } catch (err) {
            alert("Error al agregar curso: " + err.message);
          }
        });

        // Editar / Eliminar curso
        courseList.addEventListener("click", async (ev) => {
          if (ev.target.dataset.delete) {
            const id = ev.target.dataset.delete;
            if (confirm("¿Eliminar este curso?")) {
              await api.delete(`/courses/${id}`, { auth: true });
              fetchCourses();
            }
          }
          if (ev.target.dataset.edit) {
            const id = ev.target.dataset.edit;
            const newName = prompt("Nuevo nombre del curso:");
            if (newName) {
              await api.put(`/courses/${id}`, { name: newName }, { auth: true });
              fetchCourses();
            }
          }
        });

        fetchCourses();
      }

      // --- NIVELES ---
      if (module === "levels") {
        adminContent.innerHTML = `
          <h2>Gestionar Niveles</h2>
          <form id="level-form">
            <label>Nombre del nivel:</label><br>
            <input type="text" name="name"><br><br>
            <label>Descripción:</label><br>
            <textarea name="description"></textarea><br><br>
            <label>Paso:</label><br>
            <input type="number" name="step"><br><br>
            <label>ID del curso:</label><br>
            <input type="number" name="id_courses"><br><br>
            <button type="submit">Agregar Nivel</button>
          </form>
          <ul id="level-list"></ul>
        `;

        const levelList = adminContent.querySelector("#level-list");
        const levelForm = adminContent.querySelector("#level-form");

        async function fetchLevels() {
          try {
            const data = await api.get("/levels", { auth: true });
            levelList.innerHTML = data.map(l => `
              <li>
                ${l.name} 
                <a href="#" data-edit="${l.id_level}">Editar</a> | 
                <a href="#" data-delete="${l.id_level}">Eliminar</a>
              </li>
            `).join("");
          } catch (err) {
            levelList.innerHTML = `<p>Error al cargar niveles: ${err.message}</p>`;
          }
        }

        levelForm.addEventListener("submit", async (ev) => {
          ev.preventDefault();
          const formData = new FormData(levelForm);
          const body = {
            name: formData.get("name"),
            description: formData.get("description"),
            step: Number(formData.get("step")),
            id_courses: Number(formData.get("id_courses"))
          };
          try {
            await api.post("/levels", body, { auth: true });
            levelForm.reset();
            fetchLevels();
          } catch (err) {
            alert("Error al agregar nivel: " + err.message);
          }
        });

        levelList.addEventListener("click", async (ev) => {
          if (ev.target.dataset.delete) {
            const id = ev.target.dataset.delete;
            if (confirm("¿Eliminar este nivel?")) {
              await api.delete(`/levels/${id}`, { auth: true });
              fetchLevels();
            }
          }
          if (ev.target.dataset.edit) {
            const id = ev.target.dataset.edit;
            const newName = prompt("Nuevo nombre del nivel:");
            if (newName) {
              await api.put(`/levels/${id}`, { name: newName }, { auth: true });
              fetchLevels();
            }
          }
        });

        fetchLevels();
      }
    });
  });

  return section;
}
