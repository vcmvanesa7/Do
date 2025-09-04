// backend/controllers/userController.js
import supabase from "../config/db.js";

// 📌 Endpoint GET /api/profile
export const getProfile = async (req, res) => {
    try {
        const id_user = req.user.id_user; // viene del JWT (auth middleware)

        const { data: user, error } = await supabase
            .from("users")
            .select("id_user, xp_total, coins, role, photourl")
            .eq("id_user", id_user)
            .maybeSingle();

        if (error) {
            console.error("❌ Error en getProfile:", error);
            return res.status(500).json({ error: "Error obteniendo perfil" });
        }

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        return res.json(user);
    } catch (err) {
        console.error("❌ Error en getProfile:", err);
        return res.status(500).json({ error: "Error interno al obtener perfil" });
    }
};
