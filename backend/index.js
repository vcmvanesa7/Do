import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter, levelsRouter, exercisesRouter, coursesRouter } from "./routes/index.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: false
}));
app.use(express.json());

// Rutas principales
app.use('/auth', authRouter);
app.use('/levels', levelsRouter);
app.use('/exercises', exercisesRouter);
app.use('/courses', coursesRouter);

// Servidor
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
