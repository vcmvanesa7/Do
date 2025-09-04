import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importar routers centralizados
import {
  authRouter,
  levelsRouter,
  exercisesRouter,
  coursesRouter,
  theoryRouter,
  quizRouter,
  questionRouter
} from "./routes/index.js";

import progressRouter from "./routes/progressRoutes.js"; // Router de progreso

dotenv.config();

const app = express();

// ====================
//  MIDDLEWARES GLOBALES
// ====================

// Habilita CORS: permite que el frontend haga peticiones al backend
// Si usas cookies o sesiones, pon credentials: true
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: false
}));

// Para que el backend entienda JSON en el body de las peticiones
app.use(express.json());

// ====================
//  RUTAS DE LA APP
// ====================
app.use('/auth', authRouter);            // Autenticación y registro de usuarios
app.use('/levels', levelsRouter);        // Niveles del curso
app.use('/exercises', exercisesRouter);  // Ejercicios prácticos
app.use('/courses', coursesRouter);      // Cursos
app.use('/progress', progressRouter);    // Progreso del usuario (start, theory, quiz, check)
app.use('/theory', theoryRouter);        // Contenido teórico
app.use('/quiz', quizRouter);            // Quiz de evaluación
app.use('/api/quiz', quizRouter);            // Quiz de evaluación
app.use('/questions', questionRouter);   // Preguntas

// ====================
//  SERVIDOR
// ====================
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(` Servidor backend corriendo en http://localhost:${PORT}`);
});

export default app;

/*
====================
 ENDPOINTS DE PRUEBA (con Postman)
====================
POST http://localhost:3001/progress/start
POST http://localhost:3001/progress/theory/complete
POST http://localhost:3001/progress/quiz/complete
POST http://localhost:3001/progress/level/check

⚠️ Todas estas rutas requieren autenticación (token JWT en headers),
porque en progressRoutes.js usas authMiddleware.
Ejemplo de header:
Authorization: Bearer <tu_token>
*/
