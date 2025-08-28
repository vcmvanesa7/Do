// Middleware para controlar acceso según el rol del usuario
// Recibe un array con los roles permitidos para la ruta
// roleMiddleware(["admin", "guardian"])
export const roleMiddleware = (allowedRoles = []) => {
  // Devuelve el middleware que Express ejecutará en la ruta
  return (req, res, next) => {
    // Verificar si el usuario está autenticado
    // authMiddleware debe haber asignado req.user
    if (!req.user) {
      // Si no hay usuario, se devuelve 401 Unauthorized
      return res.status(401).json({ error: "No autorizado" });
    }

    // Verificar si el rol del usuario está dentro de los roles permitidos
    if (!allowedRoles.includes(req.user.role)) {
      // Si el rol no coincide, se devuelve 403 Forbidden
      return res.status(403).json({ error: "Permiso denegado" });
    }

    // Si pasa ambas verificaciones, continuar al siguiente middleware o controlador
    next();
  };
};