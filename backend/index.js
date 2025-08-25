import express from "express";
import { authRouter, levelsRouter, exercisesRouter } from "./routes/index.js";
// import supabase from "./supabaseClient.js";

const app = express()
app.use(express.json())

app.use('/auth', authRouter); // Camila
app.use('/levels', levelsRouter); // Juanito
app.use('/exercises', exercisesRouter); // alejo

app.listen(3001, () => console.log("Backend1 (auth) en http://localhost:3001"))
