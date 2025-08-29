// src/viewsjs/dashboardAdmin.js
import { navigate } from "../router.js";

export function DashboardAdminView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <div style="display: flex; height: 100vh; font-family: sans-serif;">
      <!-- Menú lateral -->
      <nav style="width: 220px; padding: 20px; border-right: 1px solid #ccc;">
        <h2>Admin</h2>
        <ul style="list-style: none; padding: 0;">
          <li><a href="#" data-module="courses">📚 Cursos</a></li>
          <li><a href="#" data-module="levels">📈 Niveles</a></li>
        </ul>
      </nav>

      <!-- Contenido dinámico -->
      <main id="admin-content" style="flex: 1; padding: 20px;">
        <h2>Bienvenido al Dashboard</h2>
        <p>Selecciona una opción del menú lateral para empezar.</p>
      </main>
    </div>
  `;

  const adminContent = section.querySelector("#admin-content");
  const links = section.querySelectorAll("a[data-module]");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const module = link.getAttribute("data-module");

      // --- CURSOS ---
      if (module === "courses") {
        adminContent.innerHTML = `
          <h2>Gestionar Cursos</h2>
          <div style="margin-bottom: 1rem;">
            <a href="#" data-action="add-course"> Agregar Curso</a> |
            <a href="#" data-action="edit-course"> Editar Curso</a> |
            <a href="#" data-action="delete-course"> Eliminar Curso</a>
          </div>
          <div id="courses-form-area"></div>
        `;

        const area = adminContent.querySelector("#courses-form-area");

        adminContent.querySelectorAll("a[data-action]").forEach(a => {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            const action = a.getAttribute("data-action");

            if (action === "add-course") {
              area.innerHTML = `
                <form>
                  <label>Nombre del curso:</label><br>
                  <input type="text" name="name"><br><br>
                  <label>Descripción:</label><br>
                  <textarea name="description"></textarea><br><br>
                  <button type="submit">Agregar Curso</button>
                </form>
              `;
            }

            if (action === "edit-course") {
              area.innerHTML = `
                <form>
                  <label>ID del curso a editar:</label><br>
                  <input type="number" name="id_course"><br><br>
                  <label>Nuevo nombre:</label><br>
                  <input type="text" name="name"><br><br>
                  <label>Nueva descripción:</label><br>
                  <textarea name="description"></textarea><br><br>
                  <button type="submit">Editar Curso</button>
                </form>
              `;
            }

            if (action === "delete-course") {
              area.innerHTML = `
                <form>
                  <label>ID del curso a eliminar:</label><br>
                  <input type="number" name="id_course"><br><br>
                  <button type="submit">Eliminar Curso</button>
                </form>
              `;
            }
          });
        });
      }

      // --- NIVELES ---
      if (module === "levels") {
        adminContent.innerHTML = `
          <h2>Gestionar Niveles</h2>
          <div style="margin-bottom: 1rem;">
            <a href="#" data-action="add-level"> Agregar Nivel</a> |
            <a href="#" data-action="edit-level"> Editar Nivel</a> |
            <a href="#" data-action="delete-level"> Eliminar Nivel</a>
          </div>
          <div id="levels-form-area"></div>
        `;

        const area = adminContent.querySelector("#levels-form-area");

        adminContent.querySelectorAll("a[data-action]").forEach(a => {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            const action = a.getAttribute("data-action");

            if (action === "add-level") {
              area.innerHTML = `
                <form>
                  <label>Nombre del nivel:</label><br>
                  <input type="text" name="name"><br><br>
                  <label>Descripción:</label><br>
                  <textarea name="description"></textarea><br><br>
                  <label>Paso:</label><br>
                  <input type="number" name="step"><br><br>
                  <label>ID del curso:</label><br>
                  <input type="number" name="id_course"><br><br>
                  <button type="submit">Agregar Nivel</button>
                </form>
              `;
            }

            if (action === "edit-level") {
              area.innerHTML = `
                <form>
                  <label>ID del nivel a editar:</label><br>
                  <input type="number" name="id_level"><br><br>
                  <label>Nuevo nombre:</label><br>
                  <input type="text" name="name"><br><br>
                  <label>Nueva descripción:</label><br>
                  <textarea name="description"></textarea><br><br>
                  <label>Nuevo paso:</label><br>
                  <input type="number" name="step"><br><br>
                  <button type="submit">Editar Nivel</button>
                </form>
              `;
            }

            if (action === "delete-level") {
              area.innerHTML = `
                <form>
                  <label>ID del nivel a eliminar:</label><br>
                  <input type="number" name="id_level"><br><br>
                  <button type="submit">Eliminar Nivel</button>
                </form>
              `;
            }
          });
        });
      }
    });
  });

  return section;
}
