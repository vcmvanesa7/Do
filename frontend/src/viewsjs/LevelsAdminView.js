import { api } from "../services/api.js";

export function LevelsAdminView(container) {
  // Contenedor inicial
  container.innerHTML = `
    <h2>Gestionar Niveles</h2>

    <!-- Formulario Agregar -->
    <form id="level-form">
      <input type="text" name="name" placeholder="Nombre del nivel" required>
      <input type="text" name="description" placeholder="Descripción">
      <input type="number" name="step" placeholder="Paso" required>
      <select name="id_courses" required>
        <option value="">Cargando cursos...</option>
      </select>
      <button type="submit">Agregar Nivel</button>
    </form>

    <!-- Lista de niveles -->
    <ul id="level-list"></ul>

    <!-- Modal Editar -->
    <div id="edit-modal" class="modal hidden">
      <div class="modal-content">
        <h3>Editar Nivel</h3>
        <form id="edit-form">
          <input type="hidden" name="id_level">
          <input type="text" name="name" placeholder="Nombre" required>
          <input type="text" name="description" placeholder="Descripción">
          <input type="number" name="step" placeholder="Paso" required>
          <select name="id_courses" required>
            <option value="">Cargando cursos...</option>
          </select>
          <button type="submit">Guardar</button>
          <button type="button" id="close-edit">Cancelar</button>
        </form>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div id="delete-modal" class="modal hidden">
      <div class="modal-content">
        <h3>¿Eliminar nivel?</h3>
        <p id="delete-level-name"></p>
        <button id="confirm-delete">Eliminar</button>
        <button id="close-delete">Cancelar</button>
      </div>
    </div>
  `;

  const levelForm = container.querySelector("#level-form");
  const levelList = container.querySelector("#level-list");

  const editModal = container.querySelector("#edit-modal");
  const editForm = container.querySelector("#edit-form");
  const closeEdit = container.querySelector("#close-edit");

  const deleteModal = container.querySelector("#delete-modal");
  const deleteName = container.querySelector("#delete-level-name");
  const confirmDelete = container.querySelector("#confirm-delete");
  const closeDelete = container.querySelector("#close-delete");

  const addCourseSelect = levelForm.elements["id_courses"];
  const editCourseSelect = editForm.elements["id_courses"];

  let levels = [];
  let levelToDelete = null;

  const openModal = modal => modal.classList.remove("hidden");
  const closeModal = modal => modal.classList.add("hidden");

  // ===============================
  // Traer cursos para dropdown
  // ===============================
  async function fetchCoursesOptions() {
    try {
      const response = await api.get("/courses", { auth: true });
      const courses = Array.isArray(response.courses) ? response.courses : [];
      const options = courses.map(c => `<option value="${c.id_courses}">${c.name}</option>`).join("");
      addCourseSelect.innerHTML = `<option value="">Selecciona un curso</option>${options}`;
      editCourseSelect.innerHTML = `<option value="">Selecciona un curso</option>${options}`;
    } catch (err) {
      addCourseSelect.innerHTML = `<option value="">Error al cargar cursos</option>`;
      editCourseSelect.innerHTML = `<option value="">Error al cargar cursos</option>`;
    }
  }

  // ===============================
  // Traer niveles
  // ===============================
  async function fetchLevels() {
    try {
      const response = await api.get("/levels", { auth: true });
      levels = Array.isArray(response.levels) ? response.levels : [];
      levelList.innerHTML = levels.map(l => `
        <li>
          <strong>${l.name}</strong> - ${l.description || ''} (Paso: ${l.step}, Curso ID: ${l.id_courses})
          <button data-edit='${JSON.stringify(l)}'>Editar</button>
          <button data-id='${l.id_level}' class="btn-delete">Eliminar</button>
        </li>
      `).join("");
    } catch (err) {
      levelList.innerHTML = `<li>Error al cargar niveles: ${err.message}</li>`;
    }
  }

  // ===============================
  // Agregar nivel
  // ===============================
  levelForm.addEventListener("submit", async ev => {
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

  // ===============================
  // Click en lista: Editar o Eliminar
  // ===============================
  levelList.addEventListener("click", ev => {
    // Editar
    if (ev.target.dataset.edit) {
      const level = JSON.parse(ev.target.dataset.edit);
      editForm.elements["id_level"].value = level.id_level;
      editForm.elements["name"].value = level.name;
      editForm.elements["description"].value = level.description || "";
      editForm.elements["step"].value = level.step;
      editForm.elements["id_courses"].value = level.id_courses;
      openModal(editModal);
    }

    // Eliminar
    if (ev.target.classList.contains("btn-delete")) {
      const id = Number(ev.target.dataset.id);
      const level = levels.find(l => l.id_level === id);
      if (!level) return;
      levelToDelete = id;
      deleteName.textContent = `Nivel: ${level.name}`;
      openModal(deleteModal);
    }
  });

  // ===============================
  // Guardar edición
  // ===============================
  editForm.addEventListener("submit", async ev => {
    ev.preventDefault();
    const formData = new FormData(editForm);
    const id = formData.get("id_level");
    const body = {
      name: formData.get("name"),
      description: formData.get("description"),
      step: Number(formData.get("step")),
      id_courses: Number(formData.get("id_courses"))
    };
    try {
      await api.put(`/levels/${id}`, body, { auth: true });
      closeModal(editModal);
      fetchLevels();
    } catch (err) {
      alert("Error al actualizar nivel: " + err.message);
    }
  });

  closeEdit.addEventListener("click", () => closeModal(editModal));

  // ===============================
  // Confirmar eliminación
  // ===============================
  confirmDelete.addEventListener("click", async () => {
    if (!levelToDelete) return;
    try {
      await api.delete(`/levels/${levelToDelete}`, { auth: true });
      levelToDelete = null;
      closeModal(deleteModal);
      fetchLevels();
    } catch (err) {
      alert("Error al eliminar nivel: " + err.message);
    }
  });

  closeDelete.addEventListener("click", () => closeModal(deleteModal));

  // ===============================
  // Inicializar
  // ===============================
  fetchCoursesOptions();
  fetchLevels();
}
