// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importar routers
import { authRouter, levelsRouter, exercisesRouter, coursesRouter, theoryRouter } from "./routes/index.js";
import progressRouter from "./routes/progressRoutes.js";

// Configurar variables de entorno
dotenv.config();

const app = express();

// Habilita CORS: permite que el frontend pueda hacer peticiones al backend
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: false
}));

// Para que el backend entienda JSON en el body de las peticiones
app.use(express.json());

// Rutas principales
app.use('/auth', authRouter);
app.use('/levels', levelsRouter);
app.use('/exercises', exercisesRouter);
app.use('/courses', coursesRouter);
app.use('/progress', progressRouter);
app.use('/theory', theoryRouter);

// Ruta por defecto (opcional)
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// Inicia el Servidor
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
