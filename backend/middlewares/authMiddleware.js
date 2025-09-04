import { verifyToken } from "../config/jwt.js";

// Este middleware se encarga de validar el JWT que nos llega en cada petición.
// Si el token es válido, añade los datos del usuario al objeto `req` para que
// cualquier ruta protegida pueda usarlos sin tener que volver a verificar nada.
export const authMiddleware = (req, res, next) => {
  try {
    // Toma el header "Authorization" que debe venir en el formato: Bearer <token>
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Token requerido" });
    }

    // Divide el header y  queda solo con el token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Formato de token inválido" });
    }

    // Verifica y decodifica el token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id_user) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    // Guarda los datos del usuario en `req.user` para que estén disponibles
    req.user = {
      id_user: decoded.id_user,
      role: decoded.role,
      email: decoded.email,
    };

    // todo ok, pasa al siguiente middleware o controlador
    next();
  } catch (err) {
    // Si algo falla (token corrupto o vencido), devuelvo un 401
    return res.status(401).json({ error: "Token inválido o expirado", details: err.message });
  }
};