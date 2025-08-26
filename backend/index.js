import express from "express";
import { authRouter, levelsRouter, exercisesRouter } from "./routes/index.js";

require('dotenv').config();

const app = express()
app.use(express.json())

app.use('/auth', authRouter); // Camila
app.use('/levels', levelsRouter); // Juanito
app.use('/exercises', exercisesRouter); // alejo


app.listen(3001, () => console.log("Backend (auth) en http://localhost:3001"))
