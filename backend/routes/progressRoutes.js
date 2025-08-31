import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
    startLevel,
    completeTheory,
    completeQuiz,
    checkLevelCompletion,
    attemptExercise,
    getLevelProgress,
    getCourseProgress
} from "../controllers/progressController.js";
import { get } from "http";


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

router.get("/level/:id_level", getLevelProgress);

router.get("/course/:id_courses", getCourseProgress);
export default router;
