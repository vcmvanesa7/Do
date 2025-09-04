import supabase from "../config/db.js";

/* ----------------------
   GET /questions
   - Lista de preguntas
   - Filtro opcional por id_quiz
---------------------- */
export const getQuestions = async (req, res) => {
  try {
    const { id_quiz } = req.query;

    let query = supabase
      .from("questions")
      .select("id_question, id_quiz, question, options, answer, type, solution");

    if (id_quiz) query = query.eq("id_quiz", id_quiz);

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ questions: data });
  } catch (err) {
    console.error("getQuestions error:", err);
    return res.status(500).json({ error: "Error al leer preguntas" });
  }
};

/* ----------------------
   GET /questions/:id_question
---------------------- */
export const getQuestionById = async (req, res) => {
  try {
    const id_question = Number(req.params.id_question);
    if (!Number.isInteger(id_question)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const { data, error } = await supabase
      .from("questions")
      .select("id_question, id_quiz, question, options, answer, type, solution")
      .eq("id_question", id_question)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("getQuestionById error:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

/* ----------------------
   POST /questions
   - Crear pregunta (SOLO admin, controlado en rutas)
---------------------- */
export const createQuestion = async (req, res) => {
  try {
    const { id_quiz, question, options, answer, type, solution } = req.body;

    if (!id_quiz || !question || !type) {
      return res
        .status(400)
        .json({ error: "Campos obligatorios faltantes (id_quiz, question, type)" });
    }

    // Validación específica por tipo
    if (type === "multiple_choice") {
      if (!Array.isArray(options) || typeof answer !== "number" || !solution) {
        return res
          .status(400)
          .json({ error: "Para multiple_choice se requieren options (array), answer (número) y solution (texto)" });
      }
    } else if (type === "code_fix" || type === "code_creation") {
      if (!solution) {
        return res
          .status(400)
          .json({ error: "Para code_fix/code_creation se requiere solution (texto)" });
      }
    }

    const { data, error } = await supabase
      .from("questions")
      .insert([{ id_quiz, question, options, answer, type, solution }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ message: "Pregunta creada", question: data });
  } catch (err) {
    console.error("createQuestion error:", err);
    return res.status(500).json({ error: "No se pudo crear la pregunta" });
  }
};

/* ----------------------
   PUT /questions/:id_question
   - Reemplaza completamente
---------------------- */
export const updateQuestion = async (req, res) => {
  try {
    const id_question = Number(req.params.id_question);
    if (!Number.isInteger(id_question)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const { id_quiz, question, options, answer, type, solution } = req.body;
    if (!id_quiz || !question || !options || !answer || !type || !solution) {
      return res
        .status(400)
        .json({ error: "Todos los campos son requeridos" });
    }

    const { data, error } = await supabase
      .from("questions")
      .update({ id_quiz, question, options, answer, type, solution })
      .eq("id_question", id_question)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: "Pregunta actualizada", question: data });
  } catch (err) {
    console.error("updateQuestion error:", err);
    return res.status(500).json({ error: "No se pudo actualizar la pregunta" });
  }
};

/* ----------------------
   PATCH /questions/:id_question
   - Actualización parcial
---------------------- */
export const patchQuestion = async (req, res) => {
  try {
    const id_question = Number(req.params.id_question);
    if (!Number.isInteger(id_question)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const payload = {};
    if (req.body.id_quiz) payload.id_quiz = req.body.id_quiz;
    if (req.body.question) payload.question = req.body.question;
    if (req.body.options) payload.options = req.body.options;
    if (req.body.answer) payload.answer = req.body.answer;
    if (req.body.type) payload.type = req.body.type;
    if (req.body.solution) payload.solution = req.body.solution;

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: "Nada para actualizar" });
    }

    const { data, error } = await supabase
      .from("questions")
      .update(payload)
      .eq("id_question", id_question)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: "Pregunta actualizada", question: data });
  } catch (err) {
    console.error("patchQuestion error:", err);
    return res.status(500).json({ error: "No se pudo actualizar" });
  }
};

/* ----------------------
   DELETE /questions/:id_question
---------------------- */
export const deleteQuestion = async (req, res) => {
  try {
    const id_question = Number(req.params.id_question);
    if (!Number.isInteger(id_question)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const { data, error } = await supabase
      .from("questions")
      .delete()
      .eq("id_question", id_question)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: "Pregunta eliminada", question: data });
  } catch (err) {
    console.error("deleteQuestion error:", err);
    return res.status(500).json({ error: "No se pudo eliminar la pregunta" });
  }
};
