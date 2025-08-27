// src/viewsjs/level.js
// #6 Vista del nivel       

// Exportamos la función LevelView que recibe los parámetros de la ruta
export function LevelView(params) {
  // Creamos un elemento <section> que contendrá todo el contenido de la vista
  const section = document.createElement("section");

  // Obtenemos el id del nivel desde los parámetros de la ruta
  const nivelId = params.id;

  // Creamos un objeto con la teoría de cada nivel (simulada)
  const teorias = {
    1: "Teoría Nivel 1: Introducción a los conceptos básicos.",
    2: "Teoría Nivel 2: Conceptos intermedios y prácticas.",
    3: "Teoría Nivel 3: Avanzado, integración y casos prácticos."
  };

  // Creamos un objeto con los ejercicios de cada nivel (simulados)
  const ejercicios = {
    1: ["Ejercicio 1.1", "Ejercicio 1.2"],
    2: ["Ejercicio 2.1", "Ejercicio 2.2"],
    3: ["Ejercicio 3.1", "Ejercicio 3.2"]
  };

  // Generamos el HTML de la lista de ejercicios para este nivel
  // Si no existen ejercicios para el nivel, devuelve un array vacío
  const ejerciciosHTML = (ejercicios[nivelId] || []).map(e => `<li>${e}</li>`).join("");

  // Insertamos el contenido HTML en la sección
  // ⚠️ Usamos <a data-link href=""> en lugar de <button> para que SPA maneje la navegación
  section.innerHTML = `
    <h1>Nivel ${nivelId}</h1>
    <h3>Teoría</h3>
    <p>${teorias[nivelId] || "Contenido no disponible"}</p>
    <h3>Ejercicios</h3>
    <ul>${ejerciciosHTML}</ul>

    <!-- Botón que vuelve al curso, manejado automáticamente por setupNavigation() -->
    <a data-link href="/course/${nivelId}" class="btn">Volver al Curso</a>

    <!-- Botón que vuelve al dashboard, manejado automáticamente por setupNavigation() -->
    <a data-link href="/dashboard" class="btn">Volver al Dashboard</a>
  `;

  // Devolvemos la sección para que router.js la agregue al DOM
  return section;
}
