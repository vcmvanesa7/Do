import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { authRouter, levelsRouter, exercisesRouter, coursesRouter, theoryRouter, quizRouter } from "./routes/index.js";
import progressRouter from "./routes/progressRoutes.js";


dotenv.config();

const app = express();

//// Habilita CORS: permite que el frontend pueda hacer peticiones al backend
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: false
}));
//// Para que el backend entienda JSON en el body de las peticiones
app.use(express.json());

// Rutas principales
app.use('/auth', authRouter);
app.use('/levels', levelsRouter);
app.use('/exercises', exercisesRouter);
app.use('/courses', coursesRouter);
app.use('/progress', progressRouter);
app.use('/theory', theoryRouter);
app.use('/quiz', quizRouter);

// Inicia el Servidor
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});