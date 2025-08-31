import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
    startLevel,
    completeTheory,
    completeQuiz,
    checkLevelCompletion,
    attemptExercise,
} from "../controllers/progressController.js";


const router = express.Router();
// Proteger todo el router
router.use(authMiddleware);

// Inicia un nivel
router.post("/start", startLevel);

// Completa una teoría
router.post("/theory/complete", completeTheory);

// Completa un quiz
router.post("/quiz/complete", completeQuiz);

// Verifica si terminó el nivel
router.post("/level/check", authMiddleware, checkLevelCompletion);

router.post("/exercise/attempt", authMiddleware, attemptExercise);

export default router;
