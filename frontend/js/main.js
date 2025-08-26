// Mostrar lenguajes 
async function fetchLanguages() {
  const res = await fetch('http://localhost:3001/levels/languages');
  const languages = await res.json();
  const container = document.getElementById('languages-container');
  container.innerHTML = languages.map(lang => `
    <button onclick="fetchLevels(${lang.id_language}, '${lang.name}')">${lang.name}</button>
  `).join('');
}

// Mostrar niveles de un lenguaje
async function fetchLevels(id_language, langName) {
  const res = await fetch(`http://localhost:3001/levels/languages/${id_language}/levels`);
  const result = await res.json();
  // Si tu endpoint devuelve { levels: [...] }
  const levels = result.levels || [];
  const container = document.getElementById('levels-container');
  container.innerHTML = `<h2>Niveles de ${langName}</h2>` + levels.map(lvl => `
    <div>
      <h4>${lvl.name}</h4>
      <p>${lvl.description}</p>
      <span>Paso: ${lvl.step}</span>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', fetchLanguages);