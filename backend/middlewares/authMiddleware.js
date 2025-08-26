import { verifyToken } from "../config/jwt.js";

export const authMiddleware = (req, res ,next) =>{

    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.stattus(401).json({error: "Token required"});

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({error: "Invalid or expired token"});

    req.user = decoded; // usuario disponible en las rutas
}