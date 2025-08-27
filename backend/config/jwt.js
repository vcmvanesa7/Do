import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "super_secret_key";

// Generar token
export function generateToken(user) {
  return jwt.sign(
    { id: user.id_user, email: user.email },
    SECRET,
    { expiresIn: "1h" }
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
