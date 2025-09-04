<<<<<<< HEAD
// backend/controllers/progressController.js
import supabase from "../config/db.js";
import OpenAI from "openai";
import { runCode } from "../utils/judgeo.js";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/*
  status en progress:
  0 = pending
  1 = in_progress
  2 = completed
  3 = failed
*/

// 1️⃣ Iniciar un nivel para un usuario
export const startLevel = async (req, res) => {
  try {
    const id_user = req.user.id_user; // ⚠️ se recomienda SIEMPRE sacar del JWT
    const { id_level } = req.body;

    // Verificar si ya existe un registro en progress
    const { data: existing, error: findErr } = await supabase
      .from("progress")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_level", id_level)
      .maybeSingle();

    if (findErr) return res.status(500).json({ error: "Error consultando progreso" });

    if (existing) {
      return res.status(200).json({ message: "Nivel ya iniciado", data: existing });
    }

    // Insertar registro
    const now = new Date().toISOString();
    const { data: inserted, error: insertErr } = await supabase
      .from("progress")
      .insert([{ id_user, id_level, startat: now, status: 1, attempts: 0, score: 0 }])
      .select()
      .single();

    if (insertErr) return res.status(500).json({ error: "Error creando progreso" });

    return res.status(201).json({ message: "Nivel iniciado con éxito", data: inserted });
  } catch (error) {
    console.error("Error en startLevel:", error);
    return res.status(500).json({ error: "Error al iniciar el nivel" });
  }
};

// 2️⃣ Marcar una theory como completada
export const completeTheory = async (req, res) => {
  try {
    const id_user = req.user.id_user; // ⚠️ sacar del JWT
    const { id_theory } = req.body;

    // Verificar si ya existe
    const { data: exists, error: e1 } = await supabase
      .from("users_theories")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_theory", id_theory)
      .maybeSingle();

    if (e1) return res.status(500).json({ error: "Error consultando users_theories" });
    if (exists) return res.status(200).json({ message: "Theory ya completada", data: exists });

    // Insertar completion
    const { data, error } = await supabase
      .from("users_theories")
      .insert([{ id_user, id_theory, completed_at: new Date().toISOString(), status: "completed" }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: "Error al guardar completion de theory" });

    // 🎁 Recompensas fijas por completar una teoría
    await supabase.rpc("increment_user_rewards", {
      p_id_user: id_user,
      p_xp: 10,
      p_coins: 1
    });

    return res.status(201).json({ message: "Theory completada ✅", data });
  } catch (err) {
    console.error("Error en completeTheory:", err);
    return res.status(500).json({ error: "Error al completar la theory" });
  }
};

// 3️⃣ Marcar un quiz como completado
export const completeQuiz = async (req, res) => {
  try {
    const id_user = req.user.id_user; // ⚠️ mejor sacarlo del JWT
    const { id_quiz, score = null } = req.body;

    // Verificar si ya existe el intento
    const { data: exists, error: e1 } = await supabase
      .from("users_quizzes")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_quiz", id_quiz)
      .maybeSingle();

    if (e1) return res.status(500).json({ error: "Error consultando users_quizzes" });

    let quizRecord;
    if (exists) {
      // update si ya existe
      const { data: updated, error: updErr } = await supabase
        .from("users_quizzes")
        .update({ score, completed_at: new Date().toISOString(), status: "completed" })
        .eq("id_user_quiz", exists.id_user_quiz)
        .select()
        .single();

      if (updErr) return res.status(500).json({ error: "Error actualizando users_quizzes" });
      quizRecord = updated;
    } else {
      // insert si no existe
      const { data, error } = await supabase
        .from("users_quizzes")
        .insert([{ id_user, id_quiz, score, completed_at: new Date().toISOString(), status: "completed" }])
        .select()
        .single();

      if (error) return res.status(500).json({ error: "Error al guardar completion de quiz" });
      quizRecord = data;
    }

    // 🎁 Recompensas escalonadas por score
    const xp = score >= 70 ? 30 : 10;
    const coins = score >= 70 ? 3 : 1;

    await supabase.rpc("increment_user_rewards", {
      p_id_user: id_user,
      p_xp: xp,
      p_coins: coins
    });

    return res.status(200).json({ message: "Quiz completado ✅", data: quizRecord });
  } catch (err) {
    console.error("Error en completeQuiz:", err);
    return res.status(500).json({ error: "Error al completar el quiz" });
  }
};


// 4️⃣ Validar si terminó el nivel (theories + quizzes + exercises)
export const checkLevelCompletion = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_level } = req.body;

    // Items del nivel
    const { data: theories } = await supabase
      .from("theory")
      .select("id_theory")
      .eq("id_level", id_level);

    const { data: quizzes } = await supabase
      .from("quiz")
      .select("id")        // ✅ PK correcta
      .eq("id_level", id_level);

    const { data: exercises } = await supabase
      .from("exercises")
      .select("id_exercise")
      .eq("id_level", id_level);

    const theoryIds = (theories || []).map(t => t.id_theory);
    const quizIds = (quizzes || []).map(q => q.id);
    const exerciseIds = (exercises || []).map(e => e.id_exercise);

    // Completados por el usuario
    const { data: userTheories } = await supabase
      .from("users_theories")
      .select("id_theory")
      .eq("id_user", id_user)
      .eq("status", "completed")
      .in("id_theory", theoryIds);

    const { data: userQuizzes } = await supabase
      .from("users_quizzes")
      .select("id_quiz")
      .eq("id_user", id_user)
      .eq("status", "passed")
      .in("id_quiz", quizIds);

    let passedExerciseIds = [];
    if (exerciseIds.length) {
      const { data: exAttempts } = await supabase
        .from("exercise_attempts")
        .select("id_exercise, passed")
        .eq("id_user", id_user)
        .in("id_exercise", exerciseIds);
      passedExerciseIds = [...new Set((exAttempts || []).filter(a => a.passed).map(a => a.id_exercise))];
    }

    const allTheories = (userTheories || []).length === theoryIds.length;
    const allQuizzes = (userQuizzes || []).length === quizIds.length;
    const allExercises = passedExerciseIds.length === exerciseIds.length;

    if (allTheories && allQuizzes && allExercises) {
      // Cierra el progreso del nivel
      await supabase
        .from("progress")
        .update({ status: 2, endat: new Date().toISOString() }) // 2 = completed
        .eq("id_user", id_user)
        .eq("id_level", id_level);

      // Otorga achievement si existe vinculado al nivel
      const { data: achievement } = await supabase
        .from("achievements")
        .select("id_achievement")
        .eq("id_level", id_level)  // ✅ ver SQL de abajo
        .maybeSingle();

      if (achievement?.id_achievement) {
        await supabase.from("users_achievements").upsert(
          [{
            id_user,
            id_achievement: achievement.id_achievement,
            unlocked_at: new Date().toISOString()
          }],
          { ignoreDuplicates: true }
        );
      }

      return res.status(200).json({
        message: "🎉 Nivel completado con éxito",
        id_level,
        achievement: achievement?.id_achievement || null
      });
    }

    // Aún falta contenido
    return res.status(200).json({
      message: "⏳ Nivel aún en progreso",
      pending: {
        theories: theoryIds.length - (userTheories?.length || 0),
        quizzes: quizIds.length - (userQuizzes?.length || 0),
        exercises: exerciseIds.length - passedExerciseIds.length
      }
    });

  } catch (error) {
    console.error("Error en checkLevelCompletion:", error);
    return res.status(500).json({ error: "Error al validar el nivel" });
  }
};

// ⬇️ Endpoint: /progress/level/:id_level
export const getLevelProgress = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_level = Number(req.params.id_level);

    // 1) Info del nivel
    const { data: level, error: levelErr } = await supabase
      .from("level")
      .select("id_level, id_courses, name, description, step, xp_reward, difficulty")
      .eq("id_level", id_level)
      .maybeSingle();
    if (levelErr || !level) return res.status(404).json({ error: "Nivel no encontrado" });

    // 2) Teorías del nivel + cuáles completó el usuario
    const { data: theories } = await supabase
      .from("theory")
      .select("id_theory, name, content")
      .eq("id_level", id_level)
      .order("id_theory", { ascending: true });

    const theoryIds = (theories || []).map(t => t.id_theory);
    const { data: userTheories } = await supabase
      .from("users_theories")
      .select("id_theory, status")
      .eq("id_user", id_user)
      .in("id_theory", theoryIds);

    const theoriesWithStatus = (theories || []).map(t => ({
      ...t,
      completed: !!(userTheories || []).find(ut => ut.id_theory === t.id_theory && ut.status === "completed")
    }));

    // 3) Quizzes del nivel + status del usuario
    const { data: quizzes } = await supabase
      .from("quiz")
      .select("id, name, id_theory, type, id_level")
      .eq("id_level", id_level)
      .order("id", { ascending: true });

    const quizIds = (quizzes || []).map(q => q.id);
    const { data: userQuizzes } = await supabase
      .from("users_quizzes")
      .select("id_quiz, status, score")
      .eq("id_user", id_user)
      .in("id_quiz", quizIds);

    const quizzesWithStatus = (quizzes || []).map(q => {
      const uq = (userQuizzes || []).find(u => u.id_quiz === q.id);
      return {
        ...q,
        completed: !!uq && uq.status === "passed",
        status: uq?.status || "pending",
        score: uq?.score || 0
      };
    });

    // 4) Ejercicios del nivel + completados por attempts (passed=true)
    const { data: exercises } = await supabase
      .from("exercises")
      .select("id_exercise, title, description, difficulty, xp_reward, coins_reward")
      .eq("id_level", id_level)
      .order("id_exercise", { ascending: true });

    const exerciseIds = (exercises || []).map(e => e.id_exercise);
    let passedExerciseIds = [];
    if (exerciseIds.length) {
      const { data: exAttempts } = await supabase
        .from("exercise_attempts")
        .select("id_exercise, passed")
        .eq("id_user", id_user)
        .in("id_exercise", exerciseIds);
      passedExerciseIds = [...new Set((exAttempts || []).filter(a => a.passed).map(a => a.id_exercise))];
    }

    const exercisesWithStatus = (exercises || []).map(e => ({
      ...e,
      completed: passedExerciseIds.includes(e.id_exercise)
    }));

    // 5) % del nivel (teorías + quizzes + ejercicios)
    const total =
      theoriesWithStatus.length + quizzesWithStatus.length + exercisesWithStatus.length;
    const completed =
      theoriesWithStatus.filter(t => t.completed).length +
      quizzesWithStatus.filter(q => q.completed).length +
      exercisesWithStatus.filter(e => e.completed).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    return res.status(200).json({
      level,
      percent,
      theories: theoriesWithStatus,
      quizzes: quizzesWithStatus,
      exercises: exercisesWithStatus
    });
  } catch (err) {
    console.error("getLevelProgress error:", err);
    return res.status(500).json({ error: "Error obteniendo progreso del nivel" });
  }
};

// controllers/progressController.js
export const getCourseProgress = async (req, res) => {
  try {
    const id_user = req.user?.id_user;
    const id_courses = Number(req.params.id_courses);
    if (!id_user || !Number.isInteger(id_courses)) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    // Niveles del curso
    const { data: levels, error: lvErr } = await supabase
      .from("level")
      .select("id_level, step")   // 👈 dejo step aquí pero no lo uso si no existe
      .eq("id_courses", id_courses)
      .order("step", { ascending: true });

    if (lvErr) throw lvErr;
    const levelIds = (levels || []).map(l => l.id_level);

    const results = [];
    let lastCompleted = true; // 👈 para desbloqueo secuencial

    for (const id_level of levelIds) {
      // Progress row (si existe)
      const { data: prog } = await supabase
        .from("progress")
        .select("status, score, attempts")
        .eq("id_user", id_user)
        .eq("id_level", id_level)
        .maybeSingle();

      // Teorías
      const { data: theories } = await supabase
        .from("theory")
        .select("id_theory")
        .eq("id_level", id_level);
      const theoryIds = (theories || []).map(t => t.id_theory);
      let theoriesCompleted = 0;
      if (theoryIds.length) {
        const { data: thDone } = await supabase
          .from("users_theories")
          .select("id_theory")
          .eq("id_user", id_user)
          .in("id_theory", theoryIds);
        theoriesCompleted = thDone?.length || 0;
      }

      // Quizzes
      const { data: quizzes } = await supabase
        .from("quiz")
        .select("id")
        .eq("id_level", id_level);
      const quizIds = (quizzes || []).map(q => q.id);
      let quizzesCompleted = 0;
      if (quizIds.length) {
        const { data: qDone } = await supabase
          .from("users_quizzes")
          .select("id_quiz")
          .eq("id_user", id_user)
          .in("id_quiz", quizIds)
          .eq("status", "completed");
        quizzesCompleted = qDone?.length || 0;
      }

      // Calcular porcentaje
      let percent = 0;
      if (prog?.status >= 1) percent += 10;
      if (theoryIds.length) percent += Math.round((theoriesCompleted / theoryIds.length) * 60);
      if (quizIds.length) percent += Math.round((quizzesCompleted / quizIds.length) * 30);
      if (prog?.status === 2) percent = 100;
      if (percent > 100) percent = 100;

      // Lógica de desbloqueo (nuevo campo, sin romper nada)
      const unlocked = lastCompleted;
      if (percent < 100) lastCompleted = false;

      results.push({
        id_level,
        status: prog?.status ?? 0,
        score: prog?.score ?? 0,
        attempts: prog?.attempts ?? 0,
        theoriesCompleted,
        totalTheories: theoryIds.length,
        quizzesCompleted,
        totalQuizzes: quizIds.length,
        percent,
        unlocked,
      });
    }

    return res.json({ id_courses, levels: results });
  } catch (err) {
    console.error("getCourseProgress error:", err);
    return res.status(500).json({ error: "Error obteniendo progreso del curso" });
  }
};

// ⬆️ FIN getCourseProgress

export const attemptExercise = async (req, res) => {
  try {
    console.log("📥 attemptExercise llamado con body:", req.body);

    // Usuario detectado
    const id_user = req.user?.id_user || req.user?.id || req.user?.user_id;
    console.log("👤 Usuario detectado:", id_user);

    // Extraer datos del body
    const { id_exercise, code, language = "python" } = req.body;
    console.log("📌 Datos recibidos:", { id_exercise, language, codeSnippet: code?.slice(0, 50) });

    // Validaciones iniciales
    if (!id_exercise) {
      console.warn("⚠️ Falta id_exercise en la request");
      return res.status(400).json({ error: "Falta id_exercise" });
    }
    if (!code || code.trim() === "") {
      console.warn("⚠️ El código está vacío");
      return res.status(400).json({ error: "El código no puede estar vacío" });
    }

    // 1) Buscar ejercicio
    console.log("🔎 Buscando ejercicio en BD...");
    const { data: exercise, error: exErr } = await supabase
      .from("exercises")
      .select("id_exercise, id_level, title, tests, xp_reward, coins_reward")
      .eq("id_exercise", id_exercise)
      .maybeSingle();

    if (exErr) {
      console.error("❌ Error obteniendo ejercicio:", exErr);
      return res.status(500).json({ error: "Error al obtener ejercicio" });
    }
    if (!exercise) {
      console.warn("⚠️ Ejercicio no encontrado:", id_exercise);
      return res.status(404).json({ error: "Ejercicio no encontrado" });
    }
    console.log("✅ Ejercicio encontrado:", exercise.title);

    const tests = Array.isArray(exercise.tests) ? exercise.tests : [];
    console.log("🧪 Tests cargados:", tests);

    // 2) Ejecutar código con los tests
    let passed = true;
    let finalStdout = "";
    let finalStderr = "";
    let runtime_ms = 0;

    for (const [i, tc] of tests.entries()) {
      console.log(`▶️ Ejecutando test #${i + 1}:`, tc);
      try {
        const run = await runCode(language, code, tc.stdin ?? "");

        console.log("⏱️ Resultado ejecución:", run);

        finalStdout = run.stdout || "";
        finalStderr = run.stderr || "";
        runtime_ms += Number(run.time_ms || 0);

        const expected = (tc.expected_stdout ?? "").replace(/\r\n/g, "\n").trim();
        const got = (finalStdout ?? "").replace(/\r\n/g, "\n").trim();

        console.log("🔍 Comparando salida:", { expected, got });

        if (expected !== got) {
          console.warn("❌ Test falló en comparación");
          passed = false;
          break;
        }
      } catch (e) {
        console.error("❌ Error ejecutando test:", e);
        passed = false;
        finalStderr = e.message;
        break;
      }
    }

    // 3) Guardar intento
    const payload = {
      id_exercise,
      id_user,
      code,
      stdout: finalStdout,
      stderr: finalStderr,
      passed,
      score: passed ? 100 : 0,
      runtime_ms: Math.round(runtime_ms),
      created_at: new Date().toISOString()
    };
    console.log("💾 Guardando intento:", payload);

    const { error: attErr } = await supabase.from("exercise_attempts").insert([payload]);

    if (attErr) {
      console.error("❌ Error al guardar intento:", attErr);
      return res.status(500).json({ error: "Error al guardar intento", details: attErr.message });
    }
    console.log("✅ Intento guardado correctamente");

    // 4) Revisar últimos intentos para hints
    console.log("📊 Consultando intentos recientes...");
    const { data: recentAttempts } = await supabase
      .from("exercise_attempts")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_exercise", id_exercise)
      .order("created_at", { ascending: false })
      .limit(3);

    console.log("📜 Últimos intentos:", recentAttempts);

    const fails = (recentAttempts || []).filter(a => !a.passed).length;

    let hint = null;
    let hintCost = 0;

    if (!passed && fails >= 2) {
      console.log("💡 Intentando generar hint...");
      const { data: user } = await supabase
        .from("users")
        .select("coins")
        .eq("id_user", id_user)
        .single();

      console.log("👤 Usuario con coins:", user);

      hintCost = 5;
      if ((user?.coins ?? 0) >= hintCost) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres un coach de programación. Da pistas breves sin la solución completa." },
              { role: "user", content: `Estoy resolviendo el ejercicio ${id_exercise}. Mi código:\n${code}\nSalida/errores:\n${finalStderr || finalStdout}` }
            ]
          });

          hint = response.choices?.[0]?.message?.content || "Revisa el formato de salida y la entrada.";
          console.log("✅ Hint generado:", hint);

          await supabase.from("users_hints").insert([{
            id_user,
            id_exercise,
            hint_text: hint,
            coins_spent: hintCost
          }]);

          await supabase.rpc("increment_user_rewards", {
            p_id_user: id_user,
            p_xp: 0,
            p_coins: -hintCost
          });
        } catch (e) {
          console.error("❌ Error generando hint:", e);
          hint = "No se pudo generar un hint en este momento.";
        }
      } else {
        hint = "No tienes suficientes coins para recibir un hint.";
        console.warn("⚠️ Usuario sin coins suficientes");
      }
    }

    // 5) Recompensas si pasa por primera vez
    let first_time = false;
    let xp_earned = 0;
    let coins_earned = 0;

    if (passed) {
      console.log("🏆 Revisando si es primera vez que pasa...");
      const { data: already } = await supabase
        .from("exercise_attempts")
        .select("id_attempt")
        .eq("id_user", id_user)
        .eq("id_exercise", id_exercise)
        .eq("passed", true)
        .limit(1);

      if (!already || already.length === 0) {
        console.log("🎉 Es la primera vez, asignando recompensas");
        first_time = true;
        xp_earned = exercise?.xp_reward || 50;
        coins_earned = exercise?.coins_reward || 10;

        await supabase.rpc("increment_user_rewards", {
          p_id_user: id_user,
          p_xp: xp_earned,
          p_coins: coins_earned
        });
      }
    }

    // ✅ Respuesta final
    console.log("📤 Respondiendo al cliente...");
    return res.status(200).json({
      message: passed ? "✅ Pruebas aprobadas" : "❌ Alguna prueba falló",
      passed,
      stdout: finalStdout,
      stderr: finalStderr,
      first_time,
      xp_earned,
      coins_earned,
      hint,
      hintCost
    });

  } catch (err) {
    console.error("❌ Error en attemptExercise:", err);
    return res.status(500).json({ error: "Error en attemptExercise", details: err.message });
  }
};


//-------
export const getExercise = async (req, res) => {
  try {
    const { id_exercise } = req.params;
    const userId = req.user.id_user;

    const { data: exercise, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("id_exercise", id_exercise)
      .maybeSingle();

    if (error) throw error;
    if (!exercise) return res.status(404).json({ error: "Ejercicio no encontrado" });

    // último intento del usuario
    const { data: attempt } = await supabase
      .from("exercise_attempts")
      .select("*")
      .eq("id_exercise", id_exercise)
      .eq("id_user", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    res.json({ ...exercise, lastAttempt: attempt || null });
  } catch (err) {
    console.error("getExercise error:", err);
    res.status(500).json({ error: "Error obteniendo ejercicio" });
  }
};

// En src/controllers/progressController.js

export const getQuiz = async (req, res) => {
  try {
    const id_user = req.user?.id_user;
    const id_quiz = Number(req.params.id_quiz);
    if (!id_user || !Number.isInteger(id_quiz)) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    // 1) Obtener info del quiz
    const { data: quiz, error: quizErr } = await supabase
      .from("quiz")
      .select("id, name, type, id_level, id_theory")
      .eq("id", id_quiz)
      .maybeSingle();
    if (quizErr) throw quizErr;
    if (!quiz) return res.status(404).json({ error: "Quiz no encontrado" });

    // 2) Obtener preguntas del quiz
    // WARNING: por ahora incluimos el campo 'answer' para scoring en frontend (DEV only).
    const { data: questions, error: qErr } = await supabase
      .from("questions")
      .select("id_question, question, options, answer, type, solution")
      .eq("id_quiz", id_quiz)
      .order("id_question", { ascending: true });

    if (qErr) throw qErr;

    // 3) Opcional: si quieres devolver si el usuario ya lo completó
    const { data: userQuiz } = await supabase
      .from("users_quizzes")
      .select("status, score, completed_at")
      .eq("id_user", id_user)
      .eq("id_quiz", id_quiz)
      .maybeSingle();

    return res.json({
      quiz: {
        id: quiz.id,
        name: quiz.name,
        type: quiz.type,
        id_level: quiz.id_level,
        id_theory: quiz.id_theory
      },
      questions: (questions || []).map(row => ({
        id: row.id_question,        // 👈 corregido
        question: row.question,
        options: row.options,
        answer: row.answer,         // ⚠️ dev only, cuidado en prod
        type: row.type,
        solution: row.solution
      })),
      userQuiz: userQuiz || null
    });
  } catch (err) {
    console.error("getQuiz error:", err);
    return res.status(500).json({ error: "Error obteniendo quiz" });
  }
};


// Nuevo endpoint seguro: POST /progress/quiz/:id_quiz/submit
export const submitQuiz = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_quiz = Number(req.params.id_quiz);
    const { answers } = req.body; // [{ id_question, selectedIndex }]

    if (!id_user || !Number.isInteger(id_quiz) || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    // 1) Traer preguntas con la respuesta correcta
    const { data: questions, error: qErr } = await supabase
      .from("questions")
      .select("id, answer")
      .eq("id_quiz", id_quiz);

    if (qErr) throw qErr;
    if (!questions?.length) return res.status(404).json({ error: "Preguntas no encontradas" });

    // 2) Comparar
    let correct = 0;
    questions.forEach(q => {
      const userAnswer = answers.find(a => a.id_question === q.id);
      if (userAnswer && userAnswer.selectedIndex === q.answer) correct++;
    });

    const total = questions.length;
    const percent = Math.round((correct / total) * 100);

    // 3) Guardar en users_quizzes
    const { data: exists } = await supabase
      .from("users_quizzes")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_quiz", id_quiz)
      .maybeSingle();

    let record;
    if (exists) {
      const { data: upd } = await supabase
        .from("users_quizzes")
        .update({
          score: percent,
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id_user_quiz", exists.id_user_quiz)
        .select()
        .single();
      record = upd;
    } else {
      const { data: ins } = await supabase
        .from("users_quizzes")
        .insert([{
          id_user,
          id_quiz,
          score: percent,
          status: "completed",
          completed_at: new Date().toISOString()
        }])
        .select()
        .single();
      record = ins;
    }

    // 4) Recompensas según score
    const xp = percent >= 70 ? 30 : 10;
    const coins = percent >= 70 ? 3 : 1;
    await supabase.rpc("increment_user_rewards", { p_id_user: id_user, p_xp: xp, p_coins: coins });

    return res.json({
      message: "Quiz evaluado",
      correct,
      total,
      percent,
      data: record
    });
  } catch (err) {
    console.error("submitQuiz error:", err);
    return res.status(500).json({ error: "Error evaluando quiz" });
  }
};
=======
// backend/controllers/progressController.js
import OpenAI from "openai";
import supabase from "../config/db.js";
import { runCode } from "../utils/judgeo.js";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/*
  status en progress:
  0 = pending
  1 = in_progress
  2 = completed
  3 = failed
*/

// 1️⃣ Iniciar un nivel para un usuario
export const startLevel = async (req, res) => {
  try {
    const id_user = req.user.id_user; // ⚠️ se recomienda SIEMPRE sacar del JWT
    const { id_level } = req.body;

    // Verificar si ya existe un registro en progress
    const { data: existing, error: findErr } = await supabase
      .from("progress")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_level", id_level)
      .maybeSingle();

    if (findErr) return res.status(500).json({ error: "Error consultando progreso" });

    if (existing) {
      return res.status(200).json({ message: "Nivel ya iniciado", data: existing });
    }

    // Insertar registro
    const now = new Date().toISOString();
    const { data: inserted, error: insertErr } = await supabase
      .from("progress")
      .insert([{ id_user, id_level, startat: now, status: 1, attempts: 0, score: 0 }])
      .select()
      .single();

    if (insertErr) return res.status(500).json({ error: "Error creando progreso" });

    return res.status(201).json({ message: "Nivel iniciado con éxito", data: inserted });
  } catch (error) {
    console.error("Error en startLevel:", error);
    return res.status(500).json({ error: "Error al iniciar el nivel" });
  }
};

// 2️⃣ Marcar una theory como completada
export const completeTheory = async (req, res) => {
  try {
    const id_user = req.user.id_user; // ⚠️ sacar del JWT
    const { id_theory } = req.body;

    // Verificar si ya existe
    const { data: exists, error: e1 } = await supabase
      .from("users_theories")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_theory", id_theory)
      .maybeSingle();

    if (e1) return res.status(500).json({ error: "Error consultando users_theories" });
    if (exists) return res.status(200).json({ message: "Theory ya completada", data: exists });

    // Insertar completion
    const { data, error } = await supabase
      .from("users_theories")
      .insert([{ id_user, id_theory, completed_at: new Date().toISOString(), status: "completed" }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: "Error al guardar completion de theory" });

    // 🎁 Recompensas fijas por completar una teoría
    await supabase.rpc("increment_user_rewards", {
      p_id_user: id_user,
      p_xp: 10,
      p_coins: 1
    });

    return res.status(201).json({ message: "Theory completada ✅", data });
  } catch (err) {
    console.error("Error en completeTheory:", err);
    return res.status(500).json({ error: "Error al completar la theory" });
  }
};

// 3️⃣ Marcar un quiz como completado
export const completeQuiz = async (req, res) => {
  try {
    const id_user = req.user.id_user; // ⚠️ mejor sacarlo del JWT
    const { id_quiz, score = null } = req.body;

    // Verificar si ya existe el intento
    const { data: exists, error: e1 } = await supabase
      .from("users_quizzes")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_quiz", id_quiz)
      .maybeSingle();

    if (e1) return res.status(500).json({ error: "Error consultando users_quizzes" });

    let quizRecord;
    if (exists) {
      // update si ya existe
      const { data: updated, error: updErr } = await supabase
        .from("users_quizzes")
        .update({ score, completed_at: new Date().toISOString(), status: "completed" })
        .eq("id_user_quiz", exists.id_user_quiz)
        .select()
        .single();

      if (updErr) return res.status(500).json({ error: "Error actualizando users_quizzes" });
      quizRecord = updated;
    } else {
      // insert si no existe
      const { data, error } = await supabase
        .from("users_quizzes")
        .insert([{ id_user, id_quiz, score, completed_at: new Date().toISOString(), status: "completed" }])
        .select()
        .single();

      if (error) return res.status(500).json({ error: "Error al guardar completion de quiz" });
      quizRecord = data;
    }

    // 🎁 Recompensas escalonadas por score
    const xp = score >= 70 ? 30 : 10;
    const coins = score >= 70 ? 3 : 1;

    await supabase.rpc("increment_user_rewards", {
      p_id_user: id_user,
      p_xp: xp,
      p_coins: coins
    });

    return res.status(200).json({ message: "Quiz completado ✅", data: quizRecord });
  } catch (err) {
    console.error("Error en completeQuiz:", err);
    return res.status(500).json({ error: "Error al completar el quiz" });
  }
};


// 4️⃣ Validar si terminó el nivel (theories + quizzes + exercises)
export const checkLevelCompletion = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_level } = req.body;

    console.log(`🔍 Verificando completación del nivel ${id_level} para usuario ${id_user}`);

    // Items del nivel
    const { data: theories } = await supabase
      .from("theory")
      .select("id_theory")
      .eq("id_level", id_level);

    const { data: quizzes } = await supabase
      .from("quiz")
      .select("id_quiz")
      .eq("id_level", id_level);

    const { data: exercises } = await supabase
      .from("exercises")
      .select("id_exercise")
      .eq("id_level", id_level);

    // ✅ CORRECCIÓN: Mapear con los campos correctos
    const theoryIds = (theories || []).map(t => t.id_theory);
    const quizIds = (quizzes || []).map(q => q.id_quiz); // ❌ Era q.id, ahora es q.id_quiz
    const exerciseIds = (exercises || []).map(e => e.id_exercise);

    console.log('📊 Contenido del nivel:', {
      theories: theoryIds.length,
      quizzes: quizIds.length,
      exercises: exerciseIds.length
    });

    // Verificar si hay contenido en el nivel
    if (theoryIds.length === 0 && quizIds.length === 0 && exerciseIds.length === 0) {
      return res.status(400).json({
        error: "El nivel no tiene contenido disponible"
      });
    }

    // Completados por el usuario
    let userTheories = [];
    if (theoryIds.length > 0) {
      const { data } = await supabase
        .from("users_theories")
        .select("id_theory")
        .eq("id_user", id_user)
        .eq("status", "completed")
        .in("id_theory", theoryIds);
      userTheories = data || [];
    }

    let userQuizzes = [];
    if (quizIds.length > 0) {
      const { data } = await supabase
        .from("users_quizzes")
        .select("id_quiz")
        .eq("id_user", id_user)
        .eq("status", "completed") // ✅ CORRECCIÓN: Cambié de "passed" a "completed"
        .in("id_quiz", quizIds);
      userQuizzes = data || [];
    }

    let passedExerciseIds = [];
    if (exerciseIds.length > 0) {
      const { data: exAttempts } = await supabase
        .from("exercise_attempts")
        .select("id_exercise, passed")
        .eq("id_user", id_user)
        .in("id_exercise", exerciseIds);
      passedExerciseIds = [...new Set((exAttempts || []).filter(a => a.passed).map(a => a.id_exercise))];
    }

    console.log('✅ Progreso del usuario:', {
      theoriesCompleted: userTheories.length,
      quizzesCompleted: userQuizzes.length,
      exercisesPassed: passedExerciseIds.length
    });

    const allTheories = userTheories.length === theoryIds.length;
    const allQuizzes = userQuizzes.length === quizIds.length;
    const allExercises = passedExerciseIds.length === exerciseIds.length;

    console.log('🎯 Estado de completación:', { allTheories, allQuizzes, allExercises });

    if (allTheories && allQuizzes && allExercises) {
      console.log('🎉 ¡Nivel completado! Actualizando progreso...');

      // ✅ CORRECCIÓN: Verificar si ya existe un registro de progreso
      const { data: existingProgress } = await supabase
        .from("progress")
        .select("*")
        .eq("id_user", id_user)
        .eq("id_level", id_level)
        .maybeSingle();

      let progressResult;
      if (existingProgress) {
        // Actualizar progreso existente
        const { data, error } = await supabase
          .from("progress")
          .update({
            status: 2, // 2 = completed
            endat: new Date().toISOString()
          })
          .eq("id_user", id_user)
          .eq("id_level", id_level)
          .select();

        if (error) {
          console.error('❌ Error actualizando progreso:', error);
          throw error;
        }
        progressResult = data;
        console.log('✅ Progreso actualizado:', progressResult);
      } else {
        // Crear nuevo registro de progreso si no existe
        const { data, error } = await supabase
          .from("progress")
          .insert([{
            id_user,
            id_level,
            status: 2, // 2 = completed
            startat: new Date().toISOString(),
            endat: new Date().toISOString()
          }])
          .select();

        if (error) {
          console.error('❌ Error creando progreso:', error);
          throw error;
        }
        progressResult = data;
        console.log('✅ Progreso creado:', progressResult);
      }

      // Otorga achievement si existe vinculado al nivel
      const { data: achievement } = await supabase
        .from("achievements")
        .select("id_achievement")
        .eq("id_level", id_level)
        .maybeSingle();

      if (achievement?.id_achievement) {
        console.log('🏆 Otorgando achievement:', achievement.id_achievement);
        const { error: achError } = await supabase
          .from("users_achievements")
          .upsert([{
            id_user,
            id_achievement: achievement.id_achievement,
            unlocked_at: new Date().toISOString()
          }], {
            ignoreDuplicates: true
          });

        if (achError) {
          console.error('❌ Error otorgando achievement:', achError);
        }
      }

      return res.status(200).json({
        message: "🎉 Nivel completado con éxito",
        id_level,
        achievement: achievement?.id_achievement || null,
        progress: progressResult,
      });
    }

    // Aún falta contenido
    const pending = {
      theories: Math.max(0, theoryIds.length - userTheories.length),
      quizzes: Math.max(0, quizIds.length - userQuizzes.length),
      exercises: Math.max(0, exerciseIds.length - passedExerciseIds.length)
    };

    console.log('⏳ Nivel en progreso. Pendiente:', pending);

    return res.status(200).json({
      message: "⏳ Nivel aún en progreso",
      pending,
      completed: {
        theories: userTheories.length,
        quizzes: userQuizzes.length,
        exercises: passedExerciseIds.length
      },
      total: {
        theories: theoryIds.length,
        quizzes: quizIds.length,
        exercises: exerciseIds.length
      },
      success: false
    });

  } catch (error) {
    console.error("❌ Error en checkLevelCompletion:", error);

    // Diferentes tipos de errores
    let statusCode = 500;
    let errorCode = "INTERNAL_ERROR";
    let errorMessage = "Error interno del servidor";

    if (error.message.includes("Usuario no autenticado")) {
      statusCode = 401;
      errorCode = "AUTH_ERROR";
      errorMessage = error.message;
    } else if (error.message.includes("inválido")) {
      statusCode = 400;
      errorCode = "VALIDATION_ERROR";
      errorMessage = error.message;
    } else if (error.message.includes("no tiene contenido")) {
      statusCode = 404;
      errorCode = "EMPTY_LEVEL";
      errorMessage = error.message;
    } else if (error.message.includes("consultando")) {
      statusCode = 503;
      errorCode = "DATABASE_ERROR";
      errorMessage = "Error de base de datos - intente nuevamente";
    } else if (error.message.includes("progreso")) {
      statusCode = 500;
      errorCode = "PROGRESS_ERROR";
      errorMessage = "Error actualizando el progreso";
    }

    return res.status(statusCode).json({
      error: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString(),
      id_level: req.body?.id_level || null,
      success: false
    });
  }
};

// ⬇️ Endpoint: /progress/level/:id_level
export const getLevelProgress = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_level = Number(req.params.id_level);

    // 1) Info del nivel
    const { data: level, error: levelErr } = await supabase
      .from("level")
      .select("id_level, id_courses, name, description, step, xp_reward, difficulty, id_next_level")
      .eq("id_level", id_level)
      .maybeSingle();
    if (levelErr || !level) return res.status(404).json({ error: "Nivel no encontrado" });

    // 2) Teorías del nivel + cuáles completó el usuario
    const { data: theories } = await supabase
      .from("theory")
      .select("id_theory, name, content")
      .eq("id_level", id_level)
      .order("id_theory", { ascending: true });

    const theoryIds = (theories || []).map(t => t.id_theory);
    const { data: userTheories } = await supabase
      .from("users_theories")
      .select("id_theory, status")
      .eq("id_user", id_user)
      .in("id_theory", theoryIds);

    const theoriesWithStatus = (theories || []).map(t => ({
      ...t,
      completed: !!(userTheories || []).find(ut => ut.id_theory === t.id_theory && ut.status === "completed")
    }));

    // 3) Quizzes del nivel + status del usuario
    const { data: quizzes } = await supabase
      .from("quiz")
      .select("id, name, id_theory, type, id_level")
      .eq("id_level", id_level)
      .order("id", { ascending: true });

    const quizIds = (quizzes || []).map(q => q.id);

    let userQuizzes = [];

    if (quizIds.length > 0) {
      const { data: userQuizzesData, error: userQuizzesError } = await supabase
        .from("users_quizzes")
        .select("id_quiz, status, score, completed_at")
        .eq("id_user", id_user)
        .in("id_quiz", quizIds);

      if (userQuizzesError) {
        console.error("Error obteninedo users_quizzes:", userQuizzesError);
      } else {
        userQuizzes = userQuizzesData || [];
      }
    }

    const quizzesWithStatus = (quizzes || []).map(q => {
      const uq = (userQuizzes || []).find(u => u.id_quiz === q.id);
      return {
        ...q,
        completed: !!uq && uq.status === "completed",
        status: uq?.status || "pending",
        score: uq?.score || 0
      };
    });

    // 4) Ejercicios del nivel + completados por attempts (passed=true)
    const { data: exercises } = await supabase
      .from("exercises")
      .select("id_exercise, title, description, difficulty, xp_reward, coins_reward")
      .eq("id_level", id_level)
      .order("id_exercise", { ascending: true });

    const exerciseIds = (exercises || []).map(e => e.id_exercise);
    let passedExerciseIds = [];
    if (exerciseIds.length) {
      const { data: exAttempts } = await supabase
        .from("exercise_attempts")
        .select("id_exercise, passed")
        .eq("id_user", id_user)
        .in("id_exercise", exerciseIds);
      passedExerciseIds = [...new Set((exAttempts || []).filter(a => a.passed).map(a => a.id_exercise))];
    }

    const exercisesWithStatus = (exercises || []).map(e => ({
      ...e,
      completed: passedExerciseIds.includes(e.id_exercise)
    }));

    // 5) % del nivel (teorías + quizzes + ejercicios)
    const total =
      theoriesWithStatus.length + quizzesWithStatus.length + exercisesWithStatus.length;
    const completed =
      theoriesWithStatus.filter(t => t.completed).length +
      quizzesWithStatus.filter(q => q.completed).length +
      exercisesWithStatus.filter(e => e.completed).length;

    const percent = total ? Math.round((completed / total) * 100) : 0;

    return res.status(200).json({
      level,
      percent,
      theories: theoriesWithStatus,
      quizzes: quizzesWithStatus,
      exercises: exercisesWithStatus
    });
  } catch (err) {
    console.error("getLevelProgress error:", err);
    return res.status(500).json({ error: "Error obteniendo progreso del nivel" });
  }
};

// controllers/progressController.js
export const getCourseProgress = async (req, res) => {
  try {
    const id_user = req.user?.id_user;
    const id_courses = Number(req.params.id_courses);
    if (!id_user || !Number.isInteger(id_courses)) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    // Niveles del curso
    const { data: levels, error: lvErr } = await supabase
      .from("level")
      .select("id_level, step")   // 👈 dejo step aquí pero no lo uso si no existe
      .eq("id_courses", id_courses)
      .order("step", { ascending: true });

    if (lvErr) throw lvErr;
    const levelIds = (levels || []).map(l => l.id_level);

    const results = [];
    let lastCompleted = true; // 👈 para desbloqueo secuencial

    for (const id_level of levelIds) {
      // Progress row (si existe)
      const { data: prog } = await supabase
        .from("progress")
        .select("status, score, attempts")
        .eq("id_user", id_user)
        .eq("id_level", id_level)
        .maybeSingle();

      console.log(id_user);
      console.log(id_level)

      // Teorías
      const { data: theories } = await supabase
        .from("theory")
        .select("id_theory")
        .eq("id_level", id_level);
      const theoryIds = (theories || []).map(t => t.id_theory);
      let theoriesCompleted = 0;
      if (theoryIds.length) {
        const { data: thDone } = await supabase
          .from("users_theories")
          .select("id_theory")
          .eq("id_user", id_user)
          .in("id_theory", theoryIds);
        theoriesCompleted = thDone?.length || 0;
      }

      // Quizzes
      const { data: quizzes } = await supabase
        .from("quiz")
        .select("id")
        .eq("id_level", id_level);
      const quizIds = (quizzes || []).map(q => q.id);
      let quizzesCompleted = 0;
      if (quizIds.length) {
        const { data: qDone } = await supabase
          .from("users_quizzes")
          .select("id_quiz")
          .eq("id_user", id_user)
          .in("id_quiz", quizIds)
          .eq("status", "completed");
        quizzesCompleted = qDone?.length || 0;
      }

      // Calcular porcentaje
      let percent = 0;

      console.log('PROG',prog);
      console.log('THEORY_IDS', theoryIds);
      console.log('QUIZ_IDS', quizIds);

      if (prog?.status >= 1) percent += 10;
      if (theoryIds.length) percent += Math.round((theoriesCompleted / theoryIds.length) * 60);
      if (quizIds.length) percent += Math.round((quizzesCompleted / quizIds.length) * 30);
      if (prog?.status === 2) percent = 100;
      if (percent > 100) percent = 100;

      console.log(percent)

      // Lógica de desbloqueo (nuevo campo, sin romper nada)
      const unlocked = lastCompleted;
      if (percent < 100) lastCompleted = false;

      results.push({
        id_level,
        status: prog?.status ?? 0,
        score: prog?.score ?? 0,
        attempts: prog?.attempts ?? 0,
        theoriesCompleted,
        totalTheories: theoryIds.length,
        quizzesCompleted,
        totalQuizzes: quizIds.length,
        percent,
        unlocked,
      });
    }

    return res.json({ id_courses, levels: results });
  } catch (err) {
    console.error("getCourseProgress error:", err);
    return res.status(500).json({ error: "Error obteniendo progreso del curso" });
  }
};

// ⬆️ FIN getCourseProgress

export const attemptExercise = async (req, res) => {
  try {
    console.log("📥 attemptExercise llamado con body:", req.body);

    // Usuario detectado
    const id_user = req.user?.id_user || req.user?.id || req.user?.user_id;
    console.log("👤 Usuario detectado:", id_user);

    // Extraer datos del body
    const { id_exercise, code, language = "python" } = req.body;
    console.log("📌 Datos recibidos:", { id_exercise, language, codeSnippet: code?.slice(0, 50) });

    // Validaciones iniciales
    if (!id_exercise) {
      console.warn("⚠️ Falta id_exercise en la request");
      return res.status(400).json({ error: "Falta id_exercise" });
    }
    if (!code || code.trim() === "") {
      console.warn("⚠️ El código está vacío");
      return res.status(400).json({ error: "El código no puede estar vacío" });
    }

    // 1) Buscar ejercicio
    console.log("🔎 Buscando ejercicio en BD...");
    const { data: exercise, error: exErr } = await supabase
      .from("exercises")
      .select("id_exercise, id_level, title, tests, xp_reward, coins_reward")
      .eq("id_exercise", id_exercise)
      .maybeSingle();

    if (exErr) {
      console.error("❌ Error obteniendo ejercicio:", exErr);
      return res.status(500).json({ error: "Error al obtener ejercicio" });
    }
    if (!exercise) {
      console.warn("⚠️ Ejercicio no encontrado:", id_exercise);
      return res.status(404).json({ error: "Ejercicio no encontrado" });
    }
    console.log("✅ Ejercicio encontrado:", exercise.title);

    const tests = Array.isArray(exercise.tests) ? exercise.tests : [];
    console.log("🧪 Tests cargados:", tests);

    // 2) Ejecutar código con los tests
    let passed = true;
    let finalStdout = "";
    let finalStderr = "";
    let runtime_ms = 0;

    for (const [i, tc] of tests.entries()) {
      console.log(`▶️ Ejecutando test #${i + 1}:`, tc);
      try {
        const run = await runCode(language, code, tc.stdin ?? "");

        console.log("⏱️ Resultado ejecución:", run);

        finalStdout = run.stdout || "";
        finalStderr = run.stderr || "";
        runtime_ms += Number(run.time_ms || 0);

        const expected = (tc.expected_stdout ?? "").replace(/\r\n/g, "\n").trim();
        const got = (finalStdout ?? "").replace(/\r\n/g, "\n").trim();

        console.log("🔍 Comparando salida:", { expected, got });

        if (expected !== got) {
          console.warn("❌ Test falló en comparación");
          passed = false;
          break;
        }
      } catch (e) {
        console.error("❌ Error ejecutando test:", e);
        passed = false;
        finalStderr = e.message;
        break;
      }
    }

    // 3) Guardar intento
    const payload = {
      id_exercise,
      id_user,
      code,
      stdout: finalStdout,
      stderr: finalStderr,
      passed,
      score: passed ? 100 : 0,
      runtime_ms: Math.round(runtime_ms),
      created_at: new Date().toISOString()
    };
    console.log("💾 Guardando intento:", payload);

    const { error: attErr } = await supabase.from("exercise_attempts").insert([payload]);

    if (attErr) {
      console.error("❌ Error al guardar intento:", attErr);
      return res.status(500).json({ error: "Error al guardar intento", details: attErr.message });
    }
    console.log("✅ Intento guardado correctamente");

    // 4) Revisar últimos intentos para hints
    console.log("📊 Consultando intentos recientes...");
    const { data: recentAttempts } = await supabase
      .from("exercise_attempts")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_exercise", id_exercise)
      .order("created_at", { ascending: false })
      .limit(3);

    console.log("📜 Últimos intentos:", recentAttempts);

    const fails = (recentAttempts || []).filter(a => !a.passed).length;

    let hint = null;
    let hintCost = 0;

    if (!passed && fails >= 2) {
      console.log("💡 Intentando generar hint...");
      const { data: user } = await supabase
        .from("users")
        .select("coins")
        .eq("id_user", id_user)
        .single();

      console.log("👤 Usuario con coins:", user);

      hintCost = 5;
      if ((user?.coins ?? 0) >= hintCost) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres un coach de programación. Da pistas breves sin la solución completa." },
              { role: "user", content: `Estoy resolviendo el ejercicio ${id_exercise}. Mi código:\n${code}\nSalida/errores:\n${finalStderr || finalStdout}` }
            ]
          });

          hint = response.choices?.[0]?.message?.content || "Revisa el formato de salida y la entrada.";
          console.log("✅ Hint generado:", hint);

          await supabase.from("users_hints").insert([{
            id_user,
            id_exercise,
            hint_text: hint,
            coins_spent: hintCost
          }]);

          await supabase.rpc("increment_user_rewards", {
            p_id_user: id_user,
            p_xp: 0,
            p_coins: -hintCost
          });
        } catch (e) {
          console.error("❌ Error generando hint:", e);
          hint = "No se pudo generar un hint en este momento.";
        }
      } else {
        hint = "No tienes suficientes coins para recibir un hint.";
        console.warn("⚠️ Usuario sin coins suficientes");
      }
    }

    // 5) Recompensas si pasa por primera vez
    let first_time = false;
    let xp_earned = 0;
    let coins_earned = 0;

    if (passed) {
      console.log("🏆 Revisando si es primera vez que pasa...");
      const { data: already } = await supabase
        .from("exercise_attempts")
        .select("id_attempt")
        .eq("id_user", id_user)
        .eq("id_exercise", id_exercise)
        .eq("passed", true)
        .limit(1);

      if (!already || already.length === 0) {
        console.log("🎉 Es la primera vez, asignando recompensas");
        first_time = true;
        xp_earned = exercise?.xp_reward || 50;
        coins_earned = exercise?.coins_reward || 10;

        await supabase.rpc("increment_user_rewards", {
          p_id_user: id_user,
          p_xp: xp_earned,
          p_coins: coins_earned
        });
      }
    }

    // ✅ Respuesta final
    console.log("📤 Respondiendo al cliente...");
    return res.status(200).json({
      message: passed ? "✅ Pruebas aprobadas" : "❌ Alguna prueba falló",
      passed,
      stdout: finalStdout,
      stderr: finalStderr,
      first_time,
      xp_earned,
      coins_earned,
      hint,
      hintCost
    });

  } catch (err) {
    console.error("❌ Error en attemptExercise:", err);
    return res.status(500).json({ error: "Error en attemptExercise", details: err.message });
  }
};


//-------
export const getExercise = async (req, res) => {
  try {
    const { id_exercise } = req.params;
    const userId = req.user.id_user;

    const { data: exercise, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("id_exercise", id_exercise)
      .maybeSingle();

    if (error) throw error;
    if (!exercise) return res.status(404).json({ error: "Ejercicio no encontrado" });

    // último intento del usuario
    const { data: attempt } = await supabase
      .from("exercise_attempts")
      .select("*")
      .eq("id_exercise", id_exercise)
      .eq("id_user", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    res.json({ ...exercise, lastAttempt: attempt || null });
  } catch (err) {
    console.error("getExercise error:", err);
    res.status(500).json({ error: "Error obteniendo ejercicio" });
  }
};

// En src/controllers/progressController.js

export const getQuiz = async (req, res) => {
  try {
    const id_user = req.user?.id_user;
    const id_quiz = Number(req.params.id_quiz);
    if (!id_user || !Number.isInteger(id_quiz)) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    // 1) Obtener info del quiz
    const { data: quiz, error: quizErr } = await supabase
      .from("quiz")
      .select("id, name, type, id_level, id_theory")
      .eq("id", id_quiz)
      .maybeSingle();
    if (quizErr) throw quizErr;
    if (!quiz) return res.status(404).json({ error: "Quiz no encontrado" });

    // 2) Obtener preguntas del quiz
    // WARNING: por ahora incluimos el campo 'answer' para scoring en frontend (DEV only).
    const { data: questions, error: qErr } = await supabase
      .from("questions")
      .select("id_question, question, options, answer, type, solution")
      .eq("id_quiz", id_quiz)
      .order("id_question", { ascending: true });

    if (qErr) throw qErr;

    // 3) Opcional: si quieres devolver si el usuario ya lo completó
    const { data: userQuiz } = await supabase
      .from("users_quizzes")
      .select("status, score, completed_at")
      .eq("id_user", id_user)
      .eq("id_quiz", id_quiz)
      .maybeSingle();

    return res.json({
      quiz: {
        id: quiz.id,
        name: quiz.name,
        type: quiz.type,
        id_level: quiz.id_level,
        id_theory: quiz.id_theory
      },
      questions: (questions || []).map(row => ({
        id: row.id_question,        // 👈 corregido
        question: row.question,
        options: row.options,
        answer: row.answer,         // ⚠️ dev only, cuidado en prod
        type: row.type,
        solution: row.solution
      })),
      userQuiz: userQuiz || null
    });
  } catch (err) {
    console.error("getQuiz error:", err);
    return res.status(500).json({ error: "Error obteniendo quiz" });
  }
};


// Nuevo endpoint seguro: POST /progress/quiz/:id_quiz/submit
export const submitQuiz = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const id_quiz = Number(req.params.id_quiz);
    const { answers } = req.body; // [{ id_question, selectedIndex }]

    if (!id_user || !Number.isInteger(id_quiz) || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Parámetros inválidos" });
    }

    // 1) Traer preguntas con la respuesta correcta
    const { data: questions, error: qErr } = await supabase
      .from("questions")
      .select("id_question, answer")
      .eq("id_quiz", id_quiz);

    if (qErr) throw qErr;
    if (!questions?.length) return res.status(404).json({ error: "Preguntas no encontradas" });

    // 2) Comparar
    let correct = 0;
    questions.forEach(q => {
      const userAnswer = answers.find(a => a.id_question === q.id);
      if (userAnswer && userAnswer.selectedIndex === q.answer) correct++;
    });

    const total = questions.length;
    const percent = Math.round((correct / total) * 100);

    // 3) Guardar en users_quizzes
    const { data: exists } = await supabase
      .from("users_quizzes")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_quiz", id_quiz)
      .maybeSingle();

    let record;
    if (exists) {
      const { data: upd } = await supabase
        .from("users_quizzes")
        .update({
          score: percent,
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id_user_quiz", exists.id_user_quiz)
        .select()
        .single();
      record = upd;
    } else {
      const { data: ins } = await supabase
        .from("users_quizzes")
        .insert([{
          id_user,
          id_quiz,
          score: percent,
          status: "completed",
          completed_at: new Date().toISOString()
        }])
        .select()
        .single();
      record = ins;
    }

    // 4) Recompensas según score
    const xp = percent >= 70 ? 30 : 10;
    const coins = percent >= 70 ? 3 : 1;
    await supabase.rpc("increment_user_rewards", { p_id_user: id_user, p_xp: xp, p_coins: coins });

    return res.json({
      message: "Quiz evaluado",
      correct,
      total,
      percent,
      data: record
    });
  } catch (err) {
    console.error("submitQuiz error:", err);
    return res.status(500).json({ error: "Error evaluando quiz" });
  }
};
>>>>>>> Juanda
