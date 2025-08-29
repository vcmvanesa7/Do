// routes/theories.js
import express from "express";
import {
  getTheories,
  getTheoryById,
  createTheory,
  updateTheory,
  patchTheory,
  deleteTheory,
} from "../controllers/auththeory.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Lectura (con filtros) → user y admin
router.get("/", authMiddleware, roleMiddleware(["user", "admin"]), getTheories);

// Ver por id → user y admin
router.get("/:id_theory", authMiddleware, roleMiddleware(["user", "admin"]), getTheoryById);

// Crear → solo admin
router.post("/", authMiddleware, roleMiddleware(["admin"]), createTheory);

// Actualizar (PUT) → solo admin
router.put("/:id_theory", authMiddleware, roleMiddleware(["admin"]), updateTheory);

// Actualizar parcial (PATCH) → solo admin
router.patch("/:id_theory", authMiddleware, roleMiddleware(["admin"]), patchTheory);

// Eliminar → solo admin
router.delete("/:id_theory", authMiddleware, roleMiddleware(["admin"]), deleteTheory);

export const theoryRouter = router;

