import { api } from "../services/api.js";

export function CoursesAdminView(container) {
  // Genera todo el HTML inicial de la vista: formulario, lista y modales
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

  // Referencias a elementos de la vista
  const courseForm = container.querySelector("#course-form");
  const courseList = container.querySelector("#course-list");

  const editModal = container.querySelector("#edit-modal");
  const editForm = container.querySelector("#edit-form");
  const closeEdit = container.querySelector("#close-edit");

  const deleteModal = container.querySelector("#delete-modal");
  const deleteName = container.querySelector("#delete-course-name");
  const confirmDelete = container.querySelector("#confirm-delete");
  const closeDelete = container.querySelector("#close-delete");

  // Estado interno de la vista
  let courses = []; // aquí se van a guardar los cursos que vienen del backend
  let courseToDelete = null; // aquí guardo el ID del curso que quiero eliminar

  // Helpers para abrir/cerrar modales
  const openModal = modal => modal.classList.remove("hidden");
  const closeModal = modal => modal.classList.add("hidden");

  // Función para traer los cursos desde el backend
  async function fetchCourses() {
    try {
      const response = await api.get("/courses", { auth: true });
      courses = Array.isArray(response.courses) ? response.courses : [];
      // muestra la lista de cursos
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

  // Cuando se envía el formulario, agrega un curso nuevo
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

  // gestiona eventos en la lista para detectar clicks en editar o eliminar
  courseList.addEventListener("click", ev => {
    // Si se hace  click en Editar
    if (ev.target.dataset.edit) {
      const course = JSON.parse(ev.target.dataset.edit);
      editForm.elements["id_courses"].value = course.id_courses;
      editForm.elements["name"].value = course.name;
      editForm.elements["description"].value = course.description || "";
      openModal(editModal);
    }

    // Si se hace click en Eliminar
    if (ev.target.classList.contains("btn-delete")) {
      const id = Number(ev.target.dataset.id);
      const course = courses.find(c => c.id_courses === id);
      if (!course) return;
      courseToDelete = id;
      deleteName.textContent = `Curso: ${course.name}`;
      openModal(deleteModal);
    }
  });

  // Guardar cambios cuando se edita un curso
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

  // Cerrar modal de edición
  closeEdit.addEventListener("click", () => closeModal(editModal));

  // Confirmar eliminación de curso
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

  // Cerrar modal de eliminación
  closeDelete.addEventListener("click", () => closeModal(deleteModal));

  // Carga los cursos apenas se monta la vista
  fetchCourses();
}
