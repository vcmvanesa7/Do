// codigo HTML de conexion
<div class="container">
  <h1>Cursos</h1>
  <div id="courses" class="button-list"></div>
  <div id="description" class="description"></div>
  <h2>Niveles</h2>
  <div id="levels" class="button-list"></div>
</div>

// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', async () => {
  // Referencias a los contenedores donde mostraremos los cursos, niveles y descripciones
  const coursesContainer = document.getElementById('courses');
  const levelsContainer = document.getElementById('levels');
  const descriptionDiv = document.getElementById('description');

  try {
    // Petición al backend para obtener todos los cursos disponibles
    const res = await fetch('http://localhost:3001/levels/courses');
    const courses = await res.json();

    // Limpiamos el contenedor de cursos antes de mostrar nuevos botones
    coursesContainer.innerHTML = '';

    // Recorremos cada curso recibido del backend
    courses.forEach(course => {
      // Creamos un botón por cada curso
      const btn = document.createElement('button');
      btn.textContent = `#${course.id_course} - ${course.name}`; // Texto del botón con id y nombre
      btn.classList.add('mb-2'); // Agregamos una clase CSS para estilo (ejemplo margen)

      // Al hacer clic en el botón de un curso:
      // - Mostramos los niveles correspondientes
      // - Mostramos la descripción del curso
      btn.onclick = () => {
        mostrarNiveles(course.id_course);
        mostrarDescripcion(course);
      };

      // Agregamos el botón al contenedor de cursos en el HTML
      coursesContainer.appendChild(btn);
    });

    // Mensaje inicial cuando no se ha seleccionado ningún curso
    levelsContainer.innerHTML = '';
    descriptionDiv.textContent = 'Selecciona un curso para ver su descripción y niveles.';
  } catch (error) {
    // Si ocurre un error al cargar los cursos, lo mostramos en consola y en pantalla
    console.error('Error cargando cursos:', error);
    coursesContainer.textContent = 'No se pudieron cargar los cursos.';
  }
});

// Función para obtener y mostrar los niveles de un curso específico
async function mostrarNiveles(idCurso) {
  const levelsContainer = document.getElementById('levels');
  levelsContainer.innerHTML = ''; // Limpiamos los niveles anteriores

  try {
    // Petición al backend para obtener niveles de un curso concreto
    const res = await fetch(`http://localhost:3001/levels/courses/${idCurso}/levels`);
    const data = await res.json();

    // Usamos "data.levels" si existe, si no un array vacío
    const levels = data.levels || [];

    // Si no hay niveles, mostramos un mensaje al usuario
    if (!levels.length) {
      levelsContainer.textContent = 'No hay niveles para este curso.';
      return;
    }

    // Recorremos y mostramos cada nivel
    levels.forEach(level => {
      const wrapper = document.createElement('div'); // Contenedor para cada nivel
      wrapper.classList.add('mb-3'); // Clase CSS para margen

      // Botón que representa el nivel
      const btn = document.createElement('button');
      btn.textContent = `Nivel #${level.id_level} - ${level.name}`;
      btn.classList.add('mb-1');

      // Descripción del nivel (si existe, si no un mensaje alternativo)
      const desc = document.createElement('div');
      desc.className = 'description';
      desc.textContent = level.description || 'Sin descripción de nivel.';

      // Agregamos botón y descripción al contenedor del nivel
      wrapper.appendChild(btn);
      wrapper.appendChild(desc);

      // Agregamos el contenedor del nivel al área principal de niveles
      levelsContainer.appendChild(wrapper);
    });
  } catch (error) {
    // Si falla la petición de niveles, mostramos mensaje en consola y en la interfaz
    console.error(`Error cargando niveles del curso ${idCurso}:`, error);
    levelsContainer.textContent = 'Error al cargar niveles.';
  }
}

// Función para mostrar la descripción de un curso en el contenedor correspondiente
function mostrarDescripcion(course) {
  const descriptionDiv = document.getElementById('description');
  descriptionDiv.textContent = course.description || 'Sin descripción disponible.';
}
