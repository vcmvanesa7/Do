// src/viewsjs/profile.js
// #7 Vista de perfil       

// src/views/profile.js
export function ProfileView() {
  const section = document.createElement("section");

  const usuario = {
    nombre: "Jugador 1",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=hero",
    nivel: 5,
    xp: 1200
  };

  section.innerHTML = `
    <h1>👤 Perfil</h1>
    <img src="${usuario.avatar}" alt="avatar" class="avatar">
    <p>Nombre: ${usuario.nombre}</p>
    <p>Nivel: ${usuario.nivel}</p>
    <p>XP: ${usuario.xp}</p>
    <a data-link href="/dashboard" class="btn">Volver al Dashboard</a>
  `;

  return section;
}
