import express from "express";
import cors from "cors";
import { authRouter, levelsRouter, exercisesRouter } from "./routes/index.js";


const app = express()
app.use(cors());
app.use(express.json())

app.use('/auth', authRouter); // Camila
app.use('/levels', levelsRouter); // Juanito
app.use('/exercises', exercisesRouter); // alejo

// servidor en el que corre el backend
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});