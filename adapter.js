/**
 * server.js (versión con control de roles)
 * - Admins: creación/edición/eliminación de content (courses, theory, quiz, level)
 * - Users: consumen contenido, manejan progreso y avances
 *
 * Requisitos:
 *  npm i express dotenv @supabase/supabase-js helmet cors express-rate-limit morgan
 *
 * .env:
 *  SUPABASE_URL=https://xxx.supabase.co
 *  SUPABASE_SERVICE_ROLE=<service-role-key - BACKEND ONLY>
 *  PORT=3001
 *  CORS_ORIGIN=http://localhost:5173
 *
 * Seguridad: nunca poner SERVICE_ROLE en frontend.
 */

import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

dotenv.config();

const PORT = process.env.PORT || 3001;


if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error("Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE en .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // en prod fija dominio(s)
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(morgan("tiny"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: "Demasiadas solicitudes, intenta más tarde." },
  })
);

/* ----------------------
   Helpers / sanitización
   ---------------------- */
function sanitizeString(v) {
  if (typeof v !== "string") return v;
  return v.trim();
}

/* ----------------------
   Autenticación y roles
   ---------------------- */

/**
 * requireUser:
 * - Extrae token Bearer del header Authorization.
 * - Valida token contra Supabase y llena req.user.
 */
async function requireUser(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado: token requerido" });
    }
    const token = auth.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Token inválido" });
    }
    req.user = data.user; // user.id, user.email, user.user_metadata...
    return next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "No autorizado" });
  }
}

/**
 * requireAdmin:
 * - Llama a requireUser internamente (para extraer usuario).
 * - Intenta determinar rol consultando la tabla `users`:
 *     1) busca por columna `auth_id` igual a req.user.id (si existe)
 *     2) si falla, intenta por `id_user` si req.user.id es convertible a número
 *     3) si no hay match, intenta leer role desde user.user_metadata.role (último recurso)
 *
 * Ajusta los nombres de columnas ('role', 'auth_id', 'id_user') si tu esquema difiere.
 */
async function requireAdmin(req, res, next) {
  // Usamos requireUser para poblar req.user; si falla, responde ya.
  await new Promise((resolve) => requireUser(req, res, resolve));
  if (!req.user) return; // requireUser ya envió la respuesta

  const authId = req.user.id;
  try {
    // 1) Intento por auth_id
    let { data: userRecord, error } = await supabase
      .from("users")
      .select("id_user, role, auth_id")
      .eq("auth_id", authId)
      .limit(1)
      .maybeSingle();

    // 2) Fallback: si no existe y authId es numérico, buscar por id_user
    if (!userRecord) {
      const asNumber = Number(authId);
      if (!Number.isNaN(asNumber)) {
        const { data, error: e2 } = await supabase
          .from("users")
          .select("id_user, role, auth_id")
          .eq("id_user", asNumber)
          .limit(1)
          .maybeSingle();
        if (e2) throw e2;
        userRecord = data;
      }
    }

    // 3) Fallback: role en user_metadata (claim personalizado)
    let role = userRecord?.role || req.user.user_metadata?.role;

    if (!role) {
      // No encontramos rol; denegamos por defecto (principio de mínimo privilegio)
      return res.status(403).json({ error: "Acceso denegado: rol desconocido" });
    }

    if (typeof role === "string" && role.toLowerCase() === "admin") {
      req.user.role = "admin";
      return next();
    }

    return res.status(403).json({ error: "Acceso denegado: requiere rol admin" });
  } catch (err) {
    console.error("requireAdmin error:", err);
    return res.status(500).json({ error: "Error verificando permisos" });
  }
}

/* ----------------------
   Utilidades dominio
   ---------------------- */
async function getCompletedLevelIds(id_user) {
  const { data, error } = await supabase
    .from("user_levels")
    .select("id_level")
    .eq("id_user", id_user)
    .eq("completed", true);

  if (error) throw error;
  return data.map((r) => r.id_level);
}

/* ----------------------
   RUTAS: THEORIES (admin CRUD)
   ---------------------- */

/**
 * GET /theory
 * - Lectura pública con filtro opcional por id_level.
 * - Si se pasa id_user en query, aplica lógica de desbloqueo.
 */
app.get("/theory", async (req, res) => {
  try {
    const { id_user, id_level } = req.query;
    let query = supabase
      .from("theory")
      .select(
        `id_theory, name, content, id_level, level (id_level, name, step, id_courses)`
      );

    if (id_level) query = query.eq("id_level", id_level);

    const { data, error } = await query;
    if (error) {
      console.error("GET /theory:", error);
      return res.status(500).json({ error: "Error al leer teorías" });
    }

    if (!id_user) return res.json(data);

    const completedLevelIds = await getCompletedLevelIds(Number(id_user));
    const completedSteps = data
      .map((t) => (completedLevelIds.includes(t.level?.id_level) ? t.level?.step || 0 : 0))
      .filter(Boolean);
    const lastStep = completedSteps.length ? Math.max(...completedSteps) : 0;
    const filtered = data.filter((t) => (t.level?.step || 0) <= lastStep + 1);

    return res.json(filtered);
  } catch (err) {
    console.error("GET /theory catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * GET /theory/:id_theory
 */
app.get("/theory/:id_theory", async (req, res) => {
  try {
    const id_theory = Number(req.params.id_theory);
    if (!Number.isInteger(id_theory)) return res.status(400).json({ error: "id inválido" });

    const { data, error } = await supabase
      .from("theory")
      .select("id_theory, name, content, id_level, level (id_level, name, step)")
      .eq("id_theory", id_theory)
      .single();

    if (error) return res.status(404).json({ error: "Teoría no encontrada" });
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * POST /theory
 * - SOLO admin puede crear contenido educativo
 */
app.post("/theory", requireAdmin, async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const content = sanitizeString(req.body.content);
    const id_level = Number(req.body.id_level);

    if (!name || !content || !Number.isInteger(id_level)) {
      return res.status(400).json({ error: "Campos inválidos o faltantes" });
    }

    // Verificar que el nivel exista
    const { data: level, error: levelError } = await supabase
      .from("level")
      .select("id_level")
      .eq("id_level", id_level)
      .single();

    if (levelError || !level) return res.status(404).json({ error: "Nivel no existe" });

    const { data, error } = await supabase
      .from("theory")
      .insert([{ name, content, id_level }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: "No se pudo crear la teoría" });
    return res.status(201).json(data);
  } catch (err) {
    console.error("POST /theory catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * PUT /theory/:id_theory
 * - SOLO admin
 */
app.put("/theory/:id_theory", requireAdmin, async (req, res) => {
  try {
    const id_theory = Number(req.params.id_theory);
    if (!Number.isInteger(id_theory)) return res.status(400).json({ error: "id inválido" });

    const name = sanitizeString(req.body.name);
    const content = sanitizeString(req.body.content);
    if (!name || !content) return res.status(400).json({ error: "name y content requeridos" });

    const { data, error } = await supabase
      .from("theory")
      .update({ name, content })
      .eq("id_theory", id_theory)
      .select()
      .single();

    if (error) return res.status(500).json({ error: "No se pudo actualizar la teoría" });
    return res.json(data);
  } catch (err) {
    console.error("PUT /theory catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * PATCH /theory/:id_theory
 * - SOLO admin
 */
app.patch("/theory/:id_theory", requireAdmin, async (req, res) => {
  try {
    const id_theory = Number(req.params.id_theory);
    if (!Number.isInteger(id_theory)) return res.status(400).json({ error: "id inválido" });

    const payload = {};
    if (req.body.name) payload.name = sanitizeString(req.body.name);
    if (req.body.content) payload.content = sanitizeString(req.body.content);
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: "Nada para actualizar" });

    const { data, error } = await supabase
      .from("theory")
      .update(payload)
      .eq("id_theory", id_theory)
      .select()
      .single();

    if (error) return res.status(500).json({ error: "No se pudo actualizar" });
    return res.json(data);
  } catch (err) {
    console.error("PATCH /theory:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * DELETE /theory/:id_theory
 * - SOLO admin
 */
app.delete("/theory/:id_theory", requireAdmin, async (req, res) => {
  try {
    const id_theory = Number(req.params.id_theory);
    if (!Number.isInteger(id_theory)) return res.status(400).json({ error: "id inválido" });

    const { data, error } = await supabase
      .from("theory")
      .delete()
      .eq("id_theory", id_theory)
      .select();

    if (error) return res.status(500).json({ error: "No se pudo eliminar la teoría" });
    return res.json({ message: "Teoría eliminada", data });
  } catch (err) {
    console.error("DELETE /theory:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/* ----------------------
   RUTAS: QUIZ (admin CRUD para creación/edición/borrado)
   ---------------------- */

/**
 * POST /quiz
 * - SOLO admin crea quizzes que acompañan teorías
 */
app.post("/quiz", requireAdmin, async (req, res) => {
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
    console.error("POST /quiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * GET /quiz
 * - Lectura pública (ajustable)
 */
app.get("/quiz", async (req, res) => {
  try {
    const { id_theory } = req.query;
    let query = supabase.from("quiz").select("*");
    if (id_theory) query = query.eq("id_theory", Number(id_theory));
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: "No se pudieron obtener quizzes" });
    return res.json(data);
  } catch (err) {
    console.error("GET /quiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * PUT /quiz/:id_quiz - SOLO admin
 * PATCH /quiz/:id_quiz - SOLO admin
 * DELETE /quiz/:id_quiz - SOLO admin
 */
app.put("/quiz/:id_quiz", requireAdmin, async (req, res) => {
  try {
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) return res.status(400).json({ error: "id inválido" });

    const name = sanitizeString(req.body.name);
    const type = sanitizeString(req.body.type);
    if (!name || !type) return res.status(400).json({ error: "name y type requeridos" });

    const { data, error } = await supabase.from("quiz").update({ name, type }).eq("id", id_quiz).select().single();
    if (error) return res.status(500).json({ error: "No se pudo actualizar el quiz" });
    return res.json(data);
  } catch (err) {
    console.error("PUT /quiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

app.patch("/quiz/:id_quiz", requireAdmin, async (req, res) => {
  try {
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) return res.status(400).json({ error: "id inválido" });

    const payload = {};
    if (req.body.name) payload.name = sanitizeString(req.body.name);
    if (req.body.type) payload.type = sanitizeString(req.body.type);
    if (!Object.keys(payload).length) return res.status(400).json({ error: "Nada para actualizar" });

    const { data, error } = await supabase.from("quiz").update(payload).eq("id", id_quiz).select().single();
    if (error) return res.status(500).json({ error: "No se pudo actualizar" });
    return res.json(data);
  } catch (err) {
    console.error("PATCH /quiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

app.delete("/quiz/:id_quiz", requireAdmin, async (req, res) => {
  try {
    const id_quiz = Number(req.params.id_quiz);
    if (!Number.isInteger(id_quiz)) return res.status(400).json({ error: "id inválido" });

    const { data, error } = await supabase.from("quiz").delete().eq("id", id_quiz).select();
    if (error) return res.status(500).json({ error: "No se pudo eliminar el quiz" });
    return res.json({ message: "Quiz eliminado", data });
  } catch (err) {
    console.error("DELETE /quiz catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/* ----------------------
   RUTAS: COURSES & LEVEL (admin CRUD)
   ---------------------- */

/**
 * POST /courses - crear curso (admin)
 * Body: { name, description }
 */
app.post("/courses", requireAdmin, async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const description = sanitizeString(req.body.description || "");
    if (!name) return res.status(400).json({ error: "name requerido" });

    const { data, error } = await supabase.from("courses").insert([{ name, description }]).select().single();
    if (error) return res.status(500).json({ error: "No se pudo crear el curso" });
    return res.status(201).json(data);
  } catch (err) {
    console.error("POST /courses catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * POST /level - crear nivel (admin)
 * Body: { name, description, step, id_courses }
 */
app.post("/level", requireAdmin, async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const description = sanitizeString(req.body.description || "");
    const step = Number(req.body.step);
    const id_courses = Number(req.body.id_courses);

    if (!name || !Number.isInteger(step) || !Number.isInteger(id_courses))
      return res.status(400).json({ error: "Campos inválidos" });

    const { data, error } = await supabase.from("level").insert([{ name, description, step, id_courses }]).select().single();
    if (error) return res.status(500).json({ error: "No se pudo crear el nivel" });
    return res.status(201).json(data);
  } catch (err) {
    console.error("POST /level catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/* ----------------------
   RUTAS: PROGRESS (uso por users)
   ---------------------- */

/**
 * GET /progress?user_id= - obtener progreso de user (user o admin)
 * - Si requester es user: solo puede ver su propio progreso (o admin puede ver cualquiera)
 */
app.get("/progress", requireUser, async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { user_id } = req.query;

    // Si no pasa user_id, devolvemos progreso del requester
    const targetId = user_id ? Number(user_id) : requesterId;

    // Si requester no es admin y pide otro user_id => forbidden
    if (user_id && targetId !== requesterId) {
      // Intentamos verificar si requester es admin
      // Llamamos al requireAdmin flow ligero: si no admin => 403
      const { data: u } = await supabase.from("users").select("role, auth_id").eq("auth_id", requesterId).limit(1).maybeSingle();
      const isAdmin = u?.role?.toLowerCase?.() === "admin";
      if (!isAdmin) return res.status(403).json({ error: "No autorizado para ver progreso de otros usuarios" });
    }

    const { data, error } = await supabase.from("progress").select("*").eq("id_user", targetId);
    if (error) return res.status(500).json({ error: "No se pudo obtener progreso" });
    return res.json(data);
  } catch (err) {
    console.error("GET /progress catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * POST /progress
 * - Usuario marca/completa un nivel (uso principal por frontend cuando avanza)
 * Body: { id_level, status, startat?, endat? }
 */
app.post("/progress", requireUser, async (req, res) => {
  try {
    const id_user = req.user.id;
    const id_level = Number(req.body.id_level);
    const status = Number(req.body.status || 1); // tu definición de status
    if (!Number.isInteger(id_level)) return res.status(400).json({ error: "id_level inválido" });

    // Insertar o upsert del progreso (evitar duplicados)
    // Supabase upsert necesita constraint; si no, hacemos select + insert/update simple
    const { data: exists } = await supabase.from("progress").select("id_progress").eq("id_user", id_user).eq("id_level", id_level).limit(1).maybeSingle();

    if (exists) {
      const { data, error } = await supabase.from("progress").update({ status, endat: req.body.endat || null }).eq("id_progress", exists.id_progress).select().single();
      if (error) return res.status(500).json({ error: "No se pudo actualizar progreso" });
      return res.json(data);
    } else {
      const payload = { id_user, id_level, status, startat: req.body.startat || null, endat: req.body.endat || null };
      const { data, error } = await supabase.from("progress").insert([payload]).select().single();
      if (error) return res.status(500).json({ error: "No se pudo crear progreso" });
      return res.status(201).json(data);
    }
  } catch (err) {
    console.error("POST /progress catch:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/* ----------------------
   START SERVER
   ---------------------- */
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});