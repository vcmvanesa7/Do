// src/components/UserStats.js
import { getUserProfile } from "../services/api.js";

export async function UserStats() {
    const container = document.createElement("div");
    container.className = "reward-bar";

    try {
        const profile = await getUserProfile();

        container.innerHTML = `
      <div class="stat">
        <span>🌟</span> <span>XP total: ${profile.xp_total}</span>
      </div>
      <div class="stat">
        <span>💰</span> <span>Coins: ${profile.coins}</span>
      </div>
    `;
    } catch (err) {
        container.innerHTML = `<p>Error cargando stats</p>`;
    }

    return container;
}
