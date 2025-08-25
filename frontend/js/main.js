// Ejemplo simple de consumo de los backends
async function fetchLevels() {
  try {
    const res = await fetch("http://localhost:3002/levels")
    const data = await res.json()
    const ul = document.getElementById("levelsList")
    ul.innerHTML = ""
    data.forEach(l => {
      const li = document.createElement("li")
      li.className = "list-group-item d-flex justify-content-between align-items-center"
      li.textContent = `${l.name || l.nombre} (step: ${l.step || l.nivel_orden || l.level || ''})`
      const btn = document.createElement("button")
      btn.className = "btn btn-sm btn-primary"
      btn.textContent = "Ver ejercicios"
      btn.onclick = () => fetchExercises(l.id_level || l.id_level || l.step || l.id)
      li.appendChild(btn)
      ul.appendChild(li)
    })
  } catch (err) {
    console.error(err)
  }
}

async function fetchExercises(levelId) {
  try {
    const res = await fetch(`http://localhost:3003/exercises/${levelId}`)
    const data = await res.json()
    const ul = document.getElementById("exList")
    ul.innerHTML = ""
    data.forEach(e => {
      const li = document.createElement("li")
      li.className = "list-group-item"
      li.textContent = e.name || e.titulo || e.title
      ul.appendChild(li)
    })
  } catch (err) {
    console.error(err)
  }
}

window.addEventListener('DOMContentLoaded', () => {
  fetchLevels()
})
