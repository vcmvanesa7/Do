import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "super_secret_key";

// Generar token incluyendo rol
export function generateToken(user) {
  return jwt.sign(
    {
      id_user: user.id_user,
      email: user.email,
      role: user.role, // importante para roleMiddleware
    },
    SECRET,
    { expiresIn: "2h" }
  );
}

// Verificar token
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}