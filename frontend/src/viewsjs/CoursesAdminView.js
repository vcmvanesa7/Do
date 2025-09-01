import { api } from "../services/api.js";

export function CoursesAdminView(container) {
  container.innerHTML = `
    <h2>Gestionar Cursos</h2>

    <!-- Formulario Agregar -->
    <form id="course-form">
      <input type="text" name="name" placeholder="Nombre del curso" required>
      <input type="text" name="description" placeholder="Descripción">
      <button type="submit">Agregar Curso</button>
    </form>

    <!-- Lista de cursos -->
    <ul id="course-list"></ul>

    <!-- Modal Editar -->
    <div id="edit-modal" class="modal hidden">
      <div class="modal-content">
        <h3>Editar Curso</h3>
        <form id="edit-form">
          <input type="hidden" name="id_courses">
          <input type="text" name="name" placeholder="Nombre" required>
          <input type="text" name="description" placeholder="Descripción">
          <button type="submit">Guardar</button>
          <button type="button" id="close-edit">Cancelar</button>
        </form>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div id="delete-modal" class="modal hidden">
      <div class="modal-content">
        <h3>¿Eliminar curso?</h3>
        <p id="delete-course-name"></p>
        <button id="confirm-delete">Eliminar</button>
        <button id="close-delete">Cancelar</button>
      </div>
    </div>
  `;

  const courseForm = container.querySelector("#course-form");
  const courseList = container.querySelector("#course-list");

  const editModal = container.querySelector("#edit-modal");
  const editForm = container.querySelector("#edit-form");
  const closeEdit = container.querySelector("#close-edit");

  const deleteModal = container.querySelector("#delete-modal");
  const deleteName = container.querySelector("#delete-course-name");
  const confirmDelete = container.querySelector("#confirm-delete");
  const closeDelete = container.querySelector("#close-delete");

  let courses = [];
  let courseToDelete = null;

  const openModal = modal => modal.classList.remove("hidden");
  const closeModal = modal => modal.classList.add("hidden");

  // ===============================
  // Traer cursos
  // ===============================
  async function fetchCourses() {
    try {
      const response = await api.get("/courses", { auth: true });
      courses = Array.isArray(response.courses) ? response.courses : [];
      courseList.innerHTML = courses.map(c => `
        <li>
          <strong>${c.name}</strong> - ${c.description || ''}
          <button data-edit='${JSON.stringify(c)}'>Editar</button>
          <button data-id='${c.id_courses}' class="btn-delete">Eliminar</button>
        </li>
      `).join("");
    } catch (err) {
      courseList.innerHTML = `<li>Error al cargar cursos: ${err.message}</li>`;
    }
  }

  // ===============================
  // Agregar curso
  // ===============================
  courseForm.addEventListener("submit", async ev => {
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

  // ===============================
  // Click en lista: Editar o Eliminar
  // ===============================
  courseList.addEventListener("click", ev => {
    // Editar
    if (ev.target.dataset.edit) {
      const course = JSON.parse(ev.target.dataset.edit);
      editForm.elements["id_courses"].value = course.id_courses;
      editForm.elements["name"].value = course.name;
      editForm.elements["description"].value = course.description || "";
      openModal(editModal);
    }

    // Eliminar
    if (ev.target.classList.contains("btn-delete")) {
      const id = Number(ev.target.dataset.id);
      const course = courses.find(c => c.id_courses === id);
      if (!course) return;
      courseToDelete = id;
      deleteName.textContent = `Curso: ${course.name}`;
      openModal(deleteModal);
    }
  });

  // ===============================
  // Guardar edición
  // ===============================
  editForm.addEventListener("submit", async ev => {
    ev.preventDefault();
    const formData = new FormData(editForm);
    const id = formData.get("id_courses");
    const body = {
      name: formData.get("name"),
      description: formData.get("description")
    };
    try {
      await api.put(`/courses/${id}`, body, { auth: true });
      closeModal(editModal);
      fetchCourses();
    } catch (err) {
      alert("Error al actualizar curso: " + err.message);
    }
  });

  closeEdit.addEventListener("click", () => closeModal(editModal));

  // ===============================
  // Confirmar eliminación
  // ===============================
  confirmDelete.addEventListener("click", async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/courses/${courseToDelete}`, { auth: true });
      courseToDelete = null;
      closeModal(deleteModal);
      fetchCourses();
    } catch (err) {
      alert("Error al eliminar curso: " + err.message);
    }
  });

  closeDelete.addEventListener("click", () => closeModal(deleteModal));

  fetchCourses();
}
