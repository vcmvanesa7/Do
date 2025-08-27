import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter, levelsRouter, exercisesRouter } from "./routes/index.js"; // Solo importamos

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: false
}));
app.use(express.json());

// Montar routers
app.use('/auth', authRouter);
app.use('/levels', levelsRouter);
app.use('/exercises', exercisesRouter);

// Servidor
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
