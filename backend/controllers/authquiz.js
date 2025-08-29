// controllers/quizController.js
import supabase from "../config/db.js";

/**
 * Sanitizador local mínimo (quita tags HTML y hace trim).
 * Si más adelante quieres usar un util global, elimina esta función e importa la tuya.
 */
const sanitizeString = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").trim();
};

/**
 * POST /quiz
 * - SOLO admin crea quizzes que acompañan teorías
 */
export const createQuiz = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const type = sanitizeString(req.body.type);
    const id_theory = Number(req.body.id_theory);

    if (!name || !type || !Number.isInteger(id_theory)) {
      return res.status(400).json({ error: "Campos inválidos o faltantes" });
    }

    // Verificar teoría
    const { data: theory, error: theoryError } = await supabase
      .from("theory")
      .select("id_theory, id_level")
      .eq("id_theory", id_theory)
      .single();

    if (theoryError || !theory) return res.status(404).json({ error: "Teoría no existe" });

    const { data, error } = await supabase
      .from("quiz")
      .insert([{ name, type, id_theory }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: "No se pudo crear el quiz" });
    return res.status(201).json(data);
  } catch (err) {
    console.error("createQuiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/**
 * GET /quiz
 * - Lectura pública (ajustable)
 */
export const getQuizzes = async (req, res) => {
  try {
    const { id_theory } = req.query;
    let query = supabase.from("quiz").select("*");
    if (id_theory) query = query.eq("id_theory", Number(id_theory));
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: "No se pudieron obtener quizzes" });
    return res.json(data);
  } catch (err) {
    console.error("getQuizzes catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/**
 * PUT /quiz/:id_quiz - SOLO admin
 */
export const updateQuiz = async (req, res) => {
  try {
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) return res.status(400).json({ error: "id inválido" });

    const name = sanitizeString(req.body.name);
    const type = sanitizeString(req.body.type);
    if (!name || !type) return res.status(400).json({ error: "name y type requeridos" });

    const { data, error } = await supabase
      .from("quiz")
      .update({ name, type })
      .eq("id", id_quiz)           // mantengo la misma columna que usabas en tu código original
      .select()
      .single();

    if (error) return res.status(500).json({ error: "No se pudo actualizar el quiz" });
    return res.json(data);
  } catch (err) {
    console.error("updateQuiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/**
 * PATCH /quiz/:id_quiz - SOLO admin
 */
export const patchQuiz = async (req, res) => {
  try {
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) return res.status(400).json({ error: "id inválido" });

    const payload = {};
    if (req.body.name) payload.name = sanitizeString(req.body.name);
    if (req.body.type) payload.type = sanitizeString(req.body.type);
    if (!Object.keys(payload).length) return res.status(400).json({ error: "Nada para actualizar" });

    const { data, error } = await supabase
      .from("quiz")
      .update(payload)
      .eq("id", id_quiz)           // mantengo la misma columna que usabas en tu código original
      .select()
      .single();

    if (error) return res.status(500).json({ error: "No se pudo actualizar" });
    return res.json(data);
  } catch (err) {
    console.error("patchQuiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/**
 * DELETE /quiz/:id_quiz - SOLO admin
 */
export const deleteQuiz = async (req, res) => {
  try {
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) return res.status(400).json({ error: "id inválido" });

    const { data, error } = await supabase
      .from("quiz")
      .delete()
      .eq("id", id_quiz)          // mantengo la misma columna que usabas en tu código original
      .select();

    if (error) return res.status(500).json({ error: "No se pudo eliminar el quiz" });
    return res.json({ message: "Quiz eliminado", data });
  } catch (err) {
    console.error("deleteQuiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};
