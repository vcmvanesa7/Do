// src/viewsjs/level.js
// #6 Vista del nivel       

export function LevelView(params) {
  return `
    <section>
      <h1>Nivel ${params.id}</h1>
      <p>Aquí va la teoría y ejercicios.</p>
    </section>
  `;
}
