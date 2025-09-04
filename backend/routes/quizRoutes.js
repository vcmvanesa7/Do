import express from "express";
import {
  createQuiz,
  getQuizzes,
  getQuizById,        // Importamos la función
  updateQuiz,
  patchQuiz,
  deleteQuiz,
} from "../controllers/authquiz.js"; // O authquiz.js si usas ese nombre

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * POST /quiz → solo admin
 */
router.post("/", authMiddleware, roleMiddleware(["admin"]), createQuiz);

/**
 * GET /quiz → listado de quizzes, público
 */
router.get("/", getQuizzes);

/**
 * GET /quiz/:id_quiz → obtener quiz individual, público
 */
router.get("/:id_quiz", getQuizById);

/**
 * PUT /quiz/:id_quiz → solo admin
 */
router.put("/:id_quiz", authMiddleware, roleMiddleware(["admin"]), updateQuiz);

/**
 * PATCH /quiz/:id_quiz → solo admin
 */
router.patch("/:id_quiz", authMiddleware, roleMiddleware(["admin"]), patchQuiz);

/**
 * DELETE /quiz/:id_quiz → solo admin
 */
router.delete("/:id_quiz", authMiddleware, roleMiddleware(["admin"]), deleteQuiz);

export const quizRouter = router;