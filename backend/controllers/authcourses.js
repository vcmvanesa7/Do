// controllers/authcourses.js
import supabase from "../config/db.js";

// ---------------- GET /courses ----------------
export const getCourses = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id_course, name, description")
      .order("name", { ascending: true });

    if (error) throw error;
    res.status(200).json({ courses: data });
  } catch (error) {
    console.error("getCourses error", error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

// ---------------- GET /courses/:id ----------------
export const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id_course, name, description")
      .eq("id_course", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Curso no encontrado" });

    res.status(200).json(data);
  } catch (error) {
    console.error("getCourseById error", error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
};

// ---------------- POST /courses ----------------
export const createCourse = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "El nombre del curso es obligatorio" });
  }

  try {
    const { data, error } = await supabase
      .from("courses")
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: "Curso creado", course: data });
  } catch (error) {
    console.error("createCourse error", error);
    res.status(500).json({ error: "Error al crear el curso" });
  }
};

// ---------------- PUT /courses/:id ----------------
export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const { data, error } = await supabase
      .from("courses")
      .update({ name, description })
      .eq("id_course", id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: "Curso actualizado", course: data });
  } catch (error) {
    console.error("updateCourse error", error);
    res.status(500).json({ error: "Error al actualizar el curso" });
  }
};

// ---------------- DELETE /courses/:id ----------------
export const deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("courses")
      .delete()
      .eq("id_course", id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: "Curso eliminado", course: data });
  } catch (error) {
    console.error("deleteCourse error", error);
    res.status(500).json({ error: "Error al eliminar el curso" });
  }
};
