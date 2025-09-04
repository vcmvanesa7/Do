// routes/levels.js
import express from "express";
import {
  getAllLevels,
  getLevelById,
  getLevelsByCourse,
  createLevel,
  updateLevel,
  deleteLevel,
} from "../controllers/authlevels.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Listar todos los niveles → user y admin
router.get("/", authMiddleware, roleMiddleware(["user", "admin"]), getAllLevels);

// Ver niveles por curso → user y admin
router.get("/course/:id_courses", authMiddleware, roleMiddleware(["user", "admin"]), getLevelsByCourse);

// Ver un nivel por id → user y admin
router.get("/:id_level", authMiddleware, roleMiddleware(["user", "admin"]), getLevelById);

// Crear nivel → solo admin
router.post("/", authMiddleware, roleMiddleware(["admin"]), createLevel);

// Actualizar nivel → solo admin
router.put("/:id_level", authMiddleware, roleMiddleware(["admin"]), updateLevel);

// Eliminar nivel → solo admin
router.delete("/:id_level", authMiddleware, roleMiddleware(["admin"]), deleteLevel);

export const levelsRouter = router;