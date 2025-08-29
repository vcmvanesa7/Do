
// src/viewsjs/public.js
// #1 Vista pública 
// Exporta una función que retorna el HTML de la vista pública  
// Contiene un botón para navegar a la vista de registro 


export function PublicView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <h1>Bienvenido a la plataforma</h1>

  <img src="logs/do.svg" alt="Logo Go" width="300">
  <p>Plataforma de Aprendizaje Interactivo</p>
  <button>de programación</button>



    <p>Conéctate y empieza tu experiencia</p>
    <a data-link href="/register" class="btn">Ir a Registro</a>
    <div class="container_Gologin" >
    <p>¿Ya tienes una cuenta?</p>
    <p><a data-link href="/login">Ir a login</a></p>
    </div>
    `;

  // Si quisieras lógica extra, por ejemplo un botón que haga algo, puedes agregarla aquí
  // Por ejemplo: alert al hacer clic en el botón (opcional)
  const btn = section.querySelector(".btn");
  btn.addEventListener("click", () => {
    console.log("Redirigiendo a registro...");
    // Nota: navigate se llama automáticamente por data-link + main.js
  });

  return section;
}
