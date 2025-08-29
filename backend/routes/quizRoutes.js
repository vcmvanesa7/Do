// routes/quiz.js
import express from "express";
import {
  createQuiz,
  getQuizzes,
  updateQuiz,
  patchQuiz,
  deleteQuiz,
} from "../controllers/authquiz.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * POST /quiz → solo admin
 */
router.post("/", authMiddleware, roleMiddleware(["admin"]), createQuiz);

/**
 * GET /quiz → lectura pública (si quieres proteger, añade middlewares)
 */
router.get("/", getQuizzes);

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

