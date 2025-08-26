import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, // payload
    SECRET,
    { expiresIn: "1h" } // duración
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
};