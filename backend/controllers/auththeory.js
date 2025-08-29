import supabase from "../config/db.js";
import { getCompletedLevelIds } from "../utils/theoryCompleted.js";

/* ----------------------
   GET /theory
   - Lectura con filtro opcional por id_level.
   - Si viene id_user, aplica lógica de desbloqueo por progreso.
---------------------- */
export const getTheories = async (req, res) => {
    try {
      const { id_user, id_level } = req.query;
  
      let query = supabase
        .from("theory")
        .select(
          `id_theory, name, content, id_level, level (id_level, name, step, id_courses)`
        );
  
      if (id_level) query = query.eq("id_level", id_level);
  
      const { data, error } = await query;
      if (error) throw error;
  
      // Si no hay id_user → responder todo (con o sin filtro por id_level)
      if (!id_user) {
        return res.status(200).json({ theories: data });
      }
  
      // Si hay id_user, aplicar lógica de desbloqueo
      const userId = Number(id_user);
      if (!Number.isInteger(userId)) {
        return res.status(400).json({ error: "id_user inválido" });
      }
  
      const completedLevelIds = await getCompletedLevelIds(userId);
      const completedSteps = data
        .map((t) =>
          completedLevelIds.includes(t.level?.id_level)
            ? t.level?.step || 0
            : 0
        )
        .filter(Boolean);
  
      const lastStep = completedSteps.length ? Math.max(...completedSteps) : 0;
      const filtered = data.filter((t) => (t.level?.step || 0) <= lastStep + 1);
  
      return res.status(200).json({ theories: filtered });
    } catch (err) {
      console.error("getTheories error:", err);
      return res.status(500).json({ error: "Error al leer teorías" });
    }
  };
  
  /* ----------------------
     GET /theory/:id_theory
  ---------------------- */
  export const getTheoryById = async (req, res) => {
    try {
      const id_theory = Number(req.params.id_theory);
      if (!Number.isInteger(id_theory)) {
        return res.status(400).json({ error: "id inválido" });
      }
  
      const { data, error } = await supabase
        .from("theory")
        .select(
          "id_theory, name, content, id_level, level (id_level, name, step)"
        )
        .eq("id_theory", id_theory)
        .single();
  
      if (error || !data) {
        return res.status(404).json({ error: "Teoría no encontrada" });
      }
  
      return res.status(200).json(data);
    } catch (err) {
      console.error("getTheoryById error:", err);
      return res.status(500).json({ error: "Error interno" });
    }
  };
  
  /* ----------------------
     POST /theory
     - SOLO admin (se controla en las rutas con middlewares)
  ---------------------- */
  export const createTheory = async (req, res) => {
    try {
      const name = sanitizeString(req.body.name);
      const content = sanitizeString(req.body.content);
      const id_level = Number(req.body.id_level);
  
      if (!name || !content || !Number.isInteger(id_level)) {
        return res
          .status(400)
          .json({ error: "Campos inválidos o faltantes (name, content, id_level)" });
      }
  
      // Verificar que el nivel exista
      const { data: level, error: levelError } = await supabase
        .from("level")
        .select("id_level")
        .eq("id_level", id_level)
        .single();
  
      if (levelError || !level) {
        return res.status(404).json({ error: "Nivel no existe" });
      }
  
      const { data, error } = await supabase
        .from("theory")
        .insert([{ name, content, id_level }])
        .select()
        .single();
  
      if (error) throw error;
  
      return res.status(201).json({ message: "Teoría creada", theory: data });
    } catch (err) {
      console.error("createTheory error:", err);
      return res.status(500).json({ error: "No se pudo crear la teoría" });
    }
  };
  
  /* ----------------------
     PUT /theory/:id_theory
     - SOLO admin
  ---------------------- */
  export const updateTheory = async (req, res) => {
    try {
      const id_theory = Number(req.params.id_theory);
      if (!Number.isInteger(id_theory)) {
        return res.status(400).json({ error: "id inválido" });
      }
  
      const name = sanitizeString(req.body.name);
      const content = sanitizeString(req.body.content);
      if (!name || !content) {
        return res
          .status(400)
          .json({ error: "name y content son requeridos" });
      }
  
      const { data, error } = await supabase
        .from("theory")
        .update({ name, content })
        .eq("id_theory", id_theory)
        .select()
        .single();
  
      if (error) throw error;
  
      return res.status(200).json({ message: "Teoría actualizada", theory: data });
    } catch (err) {
      console.error("updateTheory error:", err);
      return res.status(500).json({ error: "No se pudo actualizar la teoría" });
    }
  };
  
  /* ----------------------
     PATCH /theory/:id_theory
     - SOLO admin
  ---------------------- */
  export const patchTheory = async (req, res) => {
    try {
      const id_theory = Number(req.params.id_theory);
      if (!Number.isInteger(id_theory)) {
        return res.status(400).json({ error: "id inválido" });
      }
  
      const payload = {};
      if (req.body.name) payload.name = sanitizeString(req.body.name);
      if (req.body.content) payload.content = sanitizeString(req.body.content);
  
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "Nada para actualizar" });
      }
  
      const { data, error } = await supabase
        .from("theory")
        .update(payload)
        .eq("id_theory", id_theory)
        .select()
        .single();
  
      if (error) throw error;
  
      return res.status(200).json({ message: "Teoría actualizada", theory: data });
    } catch (err) {
      console.error("patchTheory error:", err);
      return res.status(500).json({ error: "No se pudo actualizar" });
    }
  };
  
  /* ----------------------
     DELETE /theory/:id_theory
     - SOLO admin
  ---------------------- */
  export const deleteTheory = async (req, res) => {
    try {
      const id_theory = Number(req.params.id_theory);
      if (!Number.isInteger(id_theory)) {
        return res.status(400).json({ error: "id inválido" });
      }
  
      const { data, error } = await supabase
        .from("theory")
        .delete()
        .eq("id_theory", id_theory)
        .select()
        .single();
  
      if (error) throw error;
  
      return res.status(200).json({ message: "Teoría eliminada", theory: data });
    } catch (err) {
      console.error("deleteTheory error:", err);
      return res.status(500).json({ error: "No se pudo eliminar la teoría" });
    }
  };