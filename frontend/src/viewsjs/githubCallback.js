// src/views/githubCallback.js
import { navigate } from "../router.js";

export function GithubCallbackView() {
  const section = document.createElement("section");
  section.innerHTML = `<p>⏳ Autenticando con GitHub...</p>`;

  // 1. Tomar el `token` que manda tu backend en la URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    section.innerHTML = `<p>❌ No se recibió el token de GitHub</p>`;
    return section;
  }

  // 2. Guardar token en localStorage
  localStorage.setItem("token", token);

  // ⚠️ Opcional: si tu backend devuelve también el usuario, puedes guardarlo aquí.
  // Si no, puedes hacer una petición a /auth/me para traer los datos del usuario.

  (async () => {
    try {
      const res = await fetch("http://localhost:3001/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { user } = await res.json();
      localStorage.setItem("user", JSON.stringify(user));

      // 3. Redirigir según rol
      if (user.role === "admin") {
        navigate("/dashboardAdmin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      section.innerHTML = `<p>❌ Error al obtener datos del usuario: ${err.message}</p>`;
    }
  })();

  return section;
}
