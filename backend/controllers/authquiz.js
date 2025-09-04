import supabase from "../config/db.js";
import { sanitizeString } from "../utils/sanitize.js";

const VALID_TYPES = ["multiple_choice", "code_fix", "code_creation"];

/**
 * POST /quiz
 * - SOLO admin (se controla en rutas)
 */
export const createQuiz = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const type = req.body.type?.trim();
    const id_theory = Number(req.body.id_theory);

    if (!name || !VALID_TYPES.includes(type) || !Number.isInteger(id_theory)) {
      return res.status(400).json({ error: "type (ENUM), name y id_theory son obligatorios y válidos" });
    }

    // Verificar existencia de la teoría
    const { data: theory, error: theoryError } = await supabase
      .from("theory")
      .select("id_theory, id_level")
      .eq("id_theory", id_theory)
      .single();

    if (theoryError || !theory) {
      return res.status(404).json({ error: "Teoría no existe" });
    }

    const { data, error } = await supabase
      .from("quiz")
      .insert([{ name, type, id_theory }])
      .select()
      .single();

    if (error) {
      console.error("createQuiz supabase error:", error);
      return res.status(500).json({ error: "No se pudo crear el quiz" });
    }

    return res.status(201).json({ quiz: data });
  } catch (err) {
    console.error("createQuiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/**
 * GET /quiz
 */
export const getQuizzes = async (req, res) => {
  try {
    const { id_theory } = req.query;
    let query = supabase.from("quiz").select("*");

    if (id_theory) {
      const idTheoryNum = Number(id_theory);
      if (!Number.isInteger(idTheoryNum)) {
        return res.status(400).json({ error: "id_theory inválido" });
      }
      query = query.eq("id_theory", idTheoryNum);
    }

    const { data, error } = await query;
    if (error) {
      console.error("getQuizzes supabase error:", error);
      return res.status(500).json({ error: "No se pudieron obtener quizzes" });
    }

    return res.status(200).json({ quizzes: data });
  } catch (err) {
    console.error("getQuizzes catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/**
 * GET /quiz/:id_quiz
 * Obtener quiz por ID
 */
export const getQuizById = async (req, res) => {
  try {
    console.log('xd')
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { data, error } = await supabase
      .from("quiz")
      .select("id, name, type, id_theory, questions(*)")
      .eq("id", id_quiz)
      .limit(100, { foreignTable: 'questions' })
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Quiz no encontrado" });
    }

    return res.status(200).json({ quiz: data });
  } catch (err) {
    console.error("getQuizById catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/**
 * PUT /quiz/:id_quiz
 */
export const updateQuiz = async (req, res) => {
  try {
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) return res.status(400).json({ error: "id inválido" });

    const name = sanitizeString(req.body.name);
    const type = req.body.type?.trim();

    if (!name || !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "name y type (ENUM) requeridos y válidos" });
    }

    const { data, error } = await supabase
      .from("quiz")
      .update({ name, type })
      .eq("id", id_quiz)
      .select()
      .single();

    if (error) {
      console.error("updateQuiz supabase error:", error);
      return res.status(500).json({ error: "No se pudo actualizar el quiz" });
    }

    return res.status(200).json({ quiz: data });
  } catch (err) {
    console.error("updateQuiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/**
 * PATCH /quiz/:id_quiz
 */
export const patchQuiz = async (req, res) => {
  try {
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) return res.status(400).json({ error: "id inválido" });

    const payload = {};
    if (req.body.name) payload.name = sanitizeString(req.body.name);
    if (req.body.type !== undefined) {
      const type = req.body.type.trim();
      if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: "type debe ser un ENUM válido" });
      payload.type = type;
    }

    if (!Object.keys(payload).length) return res.status(400).json({ error: "Nada para actualizar" });

    const { data, error } = await supabase
      .from("quiz")
      .update(payload)
      .eq("id", id_quiz)
      .select()
      .single();

    if (error) {
      console.error("patchQuiz supabase error:", error);
      return res.status(500).json({ error: "No se pudo actualizar el quiz" });
    }

    return res.status(200).json({ quiz: data });
  } catch (err) {
    console.error("patchQuiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/**
 * DELETE /quiz/:id_quiz
 */
export const deleteQuiz = async (req, res) => {
  try {
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) return res.status(400).json({ error: "id inválido" });

    const { data, error } = await supabase
      .from("quiz")
      .delete()
      .eq("id", id_quiz)
      .select()
      .single();

    if (error) {
      console.error("deleteQuiz supabase error:", error);
      return res.status(500).json({ error: "No se pudo eliminar el quiz" });
    }

    return res.status(200).json({ message: "Quiz eliminado", quiz: data });
  } catch (err) {
    console.error("deleteQuiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};