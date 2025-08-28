import { verifyToken } from "../config/jwt.js";
import supabase from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Token requerido" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Formato de token inválido" });

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id_user", decoded.id)
      .single();

    if (error || !user) return res.status(401).json({ error: "Usuario no encontrado" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido o expirado", details: err.message });
  }
};