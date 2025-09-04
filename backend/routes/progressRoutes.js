// backend/routes/progressRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
    startLevel,
    completeTheory,
    completeQuiz,
    checkLevelCompletion,
    getLevelProgress,
    getCourseProgress,
    getExercise,
    attemptExercise,
    getQuiz,
    submitQuiz,
} from "../controllers/progressController.js";

const router = express.Router();

// Todas las rutas de progreso requieren auth
router.use(authMiddleware);

// Nivel
router.post("/start", startLevel);
router.post("/level/check", checkLevelCompletion);
router.get("/level/:id_level", getLevelProgress);
router.get("/course/:id_courses", getCourseProgress);

// Teoría
router.post("/theory/complete", completeTheory);

// Quiz
router.get("/quiz/:id_quiz", getQuiz);
router.post("/quiz/:id_quiz/submit", submitQuiz);
// (opcional, deja por compatibilidad)
router.post("/quiz/complete", completeQuiz);

// Ejercicios
router.get("/exercise/:id_exercise", getExercise);
router.post("/exercise/attempt", attemptExercise);

export default router;
