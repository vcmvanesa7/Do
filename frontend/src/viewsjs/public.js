// src/viewsjs/public.js
// Public landing page for Dö

export function PublicView() {
  const section = document.createElement("section");

  section.innerHTML = `
    <div class="public-hero card text-center">
      <img src="./public/favicon.svg" alt="Dö Logo" width="96" height="96" class="mx-auto mb-4 rounded-xl shadow">
      <h1 class="text-4xl font-bold mb-2">Welcome to Dö</h1>
      <p class="text-lg text-gray-600 mb-6">An immersive interactive platform to learn programming from scratch.</p>
      <a data-link href="/register" class="btn">Start Learning</a>
      <p class="mt-4 text-gray-500">Already have an account? 
        <a data-link href="/login" class="text-indigo-500 hover:underline">Log in</a>
      </p>
    </div>

    <div class="public-features grid mt-10 gap-6">
      <div class="card">
        <h2 class="text-xl font-semibold mb-2">🎮 Learn by Doing</h2>
        <p>Interactive coding exercises, quizzes, and challenges that keep you engaged while you learn.</p>
      </div>
      <div class="card">
        <h2 class="text-xl font-semibold mb-2">🚀 Progress Step by Step</h2>
        <p>Advance through structured levels and unlock new concepts as you build real coding skills.</p>
      </div>
      <div class="card">
        <h2 class="text-xl font-semibold mb-2">🤖 AI-Powered Help</h2>
        <p>Get instant hints and feedback from AI whenever you’re stuck, so you never learn alone.</p>
      </div>
    </div>
  `;

  const btn = section.querySelector(".btn");
  btn.addEventListener("click", () => {
    console.log("Redirecting to register...");
  });

  return section;
}
