import { navigate } from "../router.js";

export function AuthCallbackView() {
  const section = document.createElement("section");
  section.innerHTML = `<p>Procesando inicio de sesión con GitHub...</p>`;

  // Extraer token y user de la URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const user = params.get("user") ? JSON.parse(params.get("user")) : null;

  if (token && user) {
    // Guardar en localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Redirigir según rol
    if (user.role === "admin") {
      navigate("/dashboardAdmin");
    } else {
      navigate("/dashboard");
    }
  } else {
    section.innerHTML = `<p> Error al iniciar sesión con GitHub</p>`;
  }

  return section;
}
