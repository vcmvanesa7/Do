import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import supabase from "../config/db.js";

const router = express.Router();

// ---------------- GET /courses ----------------
// Listar todos los cursos → user y admin
router.get("/", authMiddleware, roleMiddleware(["user", "admin"]), async (req, res) => {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json({ courses: data });
});

// ---------------- POST /courses ----------------
// Crear curso → solo admin
router.post("/", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

  const { data, error } = await supabase
    .from("courses")
    .insert([{ name, description }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Curso creado", course: data[0] });
});

// ---------------- PUT /courses/:id ----------------
// Actualizar curso → solo admin
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const { data, error } = await supabase
    .from("courses")
    .update({ name, description })
    .eq("id_course", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Curso actualizado", course: data });
});

// ---------------- DELETE /courses/:id ----------------
// Eliminar curso → solo admin
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("courses")
    .delete()
    .eq("id_course", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Curso eliminado", course: data[0] });
});

export const coursesRouter = router;