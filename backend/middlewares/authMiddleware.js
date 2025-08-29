import { verifyToken } from "../config/jwt.js";
import supabase from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Token requerido" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Formato de token inválido" });
    console.log("Token recibido:", token);

    const decoded = verifyToken(token);
    console.log("Token decodificado:", decoded);

    if (!decoded || !decoded.id_user) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id_user", decoded.id_user)
      .single();

    if (error || !user) return res.status(401).json({ error: "Usuario no encontrado" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido o expirado", details: err.message });
  }
};