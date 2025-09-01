// middlewares/authMiddleware.js
import { verifyToken } from "../config/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Formato de token inválido" });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id_user) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    // 🔑 req.user tendrá exactamente lo que necesitamos en el resto del sistema
    req.user = {
      id_user: decoded.id_user,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado", details: err.message });
  }
};
