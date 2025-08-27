// src/viewsjs/course.js
// #5 Vista del curso
// Exporta una función que retorna el HTML de la vista del curso
// Contiene detalles del curso y enlaces a niveles

export function CourseView(params) {
  return `
    <section>
      <h1>Curso ${params.id}</h1>
      <p>Progreso: 40%</p>
      <ul>
        <li><a href="#/level/1">Nivel 1</a></li>
        <li><a href="#/level/2">Nivel 2</a></li>
      </ul>
    </section>
  `;
}
