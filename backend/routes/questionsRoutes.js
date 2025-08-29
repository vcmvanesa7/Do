// routes/questionsRoutes.js
import express from "express";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  patchQuestion,
  deleteQuestion,
} from "../controllers/outhquestions.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Listar todas las preguntas → user y admin
router.get("/", authMiddleware, roleMiddleware(["user", "admin"]), getQuestions);

// Ver una pregunta por id → user y admin
router.get("/:id_question", authMiddleware, roleMiddleware(["user", "admin"]), getQuestionById);

// Crear pregunta → solo admin
router.post("/", authMiddleware, roleMiddleware(["admin"]), createQuestion);

// Actualizar pregunta (PUT) → solo admin
router.put("/:id_question", authMiddleware, roleMiddleware(["admin"]), updateQuestion);

// Actualizar parcialmente (PATCH) → solo admin
router.patch("/:id_question", authMiddleware, roleMiddleware(["admin"]), patchQuestion);

// Eliminar pregunta → solo admin
router.delete("/:id_question", authMiddleware, roleMiddleware(["admin"]), deleteQuestion);

export const questionRouter = router;
