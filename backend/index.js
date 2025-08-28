import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter, levelsRouter, exercisesRouter,coursesRouter } from "./routes/index.js"; // Solo importamos

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Montar routers
app.use('/auth', authRouter);
app.use('/levels', levelsRouter);
app.use('/exercises', exercisesRouter);
app.use('/courses',coursesRouter);

// Servidor
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});