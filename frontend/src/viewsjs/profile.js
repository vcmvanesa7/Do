<<<<<<< HEAD
// src/viewsjs/profile.js
// #7 Vista de perfil       

export function ProfileView() {
  const section = document.createElement("section");

  const AVATARS = [
    "/avatar/avatar_hombre_1.png",
    "/avatar/avatar_hombre_2.png",
    "/avatar/avatar_hombre_3.png",
    "/avatar/avatar_mujer_1.png",
    "/avatar/avatar_mujer_2.png",
    "/avatar/avatar_mujer_3.png",
    "/avatar/avatar_mascota_1.png",
    "/avatar/avatar_mascota_2.png",
    "/avatar/avatar_mascota_3.png",
    "/avatar/avatar_robot_1.png",
    "/avatar/avatar_robot_2.png",
    "/avatar/avatar_robot_3.png",
  ];

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const nombre = currentUser.name || currentUser.nombre || "Usuario";

  const savedAvatar = localStorage.getItem(`avatar_${currentUser.id}`) || "/avatar/avatar_robot_2.png";

  section.innerHTML = `
    <h1>👤 Perfil</h1>

    <div class="profile-header">
      <div class="avatar-wrapper">
        <img id="avatarPreview" class="avatar-preview" src="${savedAvatar}" alt="Avatar actual">
      </div>
      <div class="profile-meta">
        <p><strong>Nombre:</strong> ${nombre}</p>
      </div>
    </div>

    <button id="openAvatarModal" class="btn" type="button">Cambiar avatar</button>

    <!-- Modal -->
    <div id="avatarModal" class="modal hidden">
      <div class="modal-content">
        <span id="closeAvatarModal" class="modal-close">&times;</span>
        <h2>Elige tu avatar</h2>
        <div class="avatar-grid" id="avatarGrid"></div>
      </div>
    </div>
  `;

  // Referencias
  const modal = section.querySelector("#avatarModal");
  const openBtn = section.querySelector("#openAvatarModal");
  const closeBtn = section.querySelector("#closeAvatarModal");
  const preview = section.querySelector("#avatarPreview");
  const grid = section.querySelector("#avatarGrid");

  // Abrir / cerrar modal
  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  // Pintar avatares en modal
  AVATARS.forEach((src) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avatar-item";
    btn.dataset.src = src;
    btn.innerHTML = `<img src="${src}" alt="avatar">`;
    grid.appendChild(btn);
  });

  // Selección de avatar
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".avatar-item");
    if (!btn) return;
    const src = btn.dataset.src;

    localStorage.setItem(`avatar_${currentUser.id}`, src);

    // Siempre actualiza el mismo preview <img>
    preview.src = src;

    modal.classList.add("hidden");
    window.dispatchEvent(new Event("avatarChanged"));
  });

  return section;
=======
// src/viewsjs/profile.js
// #7 Vista de perfil       

export function ProfileView() {
  const section = document.createElement("section");

  const AVATARS = [
    "/avatar/avatar_hombre_1.png",
    "/avatar/avatar_hombre_2.png",
    "/avatar/avatar_hombre_3.png",
    "/avatar/avatar_mujer_1.png",
    "/avatar/avatar_mujer_2.png",
    "/avatar/avatar_mujer_3.png",
    "/avatar/avatar_mascota_1.png",
    "/avatar/avatar_mascota_2.png",
    "/avatar/avatar_mascota_3.png",
    "/avatar/avatar_robot_1.png",
    "/avatar/avatar_robot_2.png",
    "/avatar/avatar_robot_3.png",
  ];

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const nombre = currentUser.name || currentUser.nombre || "Usuario";

  const savedAvatar = localStorage.getItem(`avatar_${currentUser.id}`) || "/avatar/avatar_robot_2.png";

  section.innerHTML = `
    <h1>👤 Perfil</h1>

    <div class="profile-header">
      <div class="avatar-wrapper">
        <img id="avatarPreview" class="avatar-preview" src="${savedAvatar}" alt="Avatar actual">
      </div>
      <div class="profile-meta">
        <p><strong>Nombre:</strong> ${nombre}</p>
      </div>
    </div>

    <button id="openAvatarModal" class="btn" type="button">Cambiar avatar</button>

    <!-- Modal -->
    <div id="avatarModal" class="modal hidden">
      <div class="modal-content">
        <span id="closeAvatarModal" class="modal-close">&times;</span>
        <h2>Elige tu avatar</h2>
        <div class="avatar-grid" id="avatarGrid"></div>
      </div>
    </div>
  `;

  // Referencias
  const modal = section.querySelector("#avatarModal");
  const openBtn = section.querySelector("#openAvatarModal");
  const closeBtn = section.querySelector("#closeAvatarModal");
  const preview = section.querySelector("#avatarPreview");
  const grid = section.querySelector("#avatarGrid");

  // Abrir / cerrar modal
  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  // Pintar avatares en modal
  AVATARS.forEach((src) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avatar-item";
    btn.dataset.src = src;
    btn.innerHTML = `<img src="${src}" alt="avatar">`;
    grid.appendChild(btn);
  });

  // Selección de avatar
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".avatar-item");
    if (!btn) return;
    const src = btn.dataset.src;

    localStorage.setItem(`avatar_${currentUser.id}`, src);

    // Siempre actualiza el mismo preview <img>
    preview.src = src;

    modal.classList.add("hidden");
    window.dispatchEvent(new Event("avatarChanged"));
  });

  return section;
>>>>>>> Juanda
}