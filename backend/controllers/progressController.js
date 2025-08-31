// backend/controllers/progressController.js
import supabase from "../config/db.js";
import OpenAI from "openai";

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
    const id_user = req.user.id_user; // ⚠️ obtenido del JWT
    const { id_level } = req.body;

    // 1. Traer todos los items del nivel
    const { data: theories } = await supabase
      .from("theory")
      .select("id_theory")
      .eq("id_level", id_level);

    const { data: quizzes } = await supabase
      .from("quiz")
      .select("id_quiz") // ⚠️ usa la PK real de quiz
      .eq("id_level", id_level);

    const { data: exercises } = await supabase
      .from("exercises")
      .select("id_exercise")
      .eq("id_level", id_level);

    const theoryIds = (theories || []).map(t => t.id_theory);
    const quizIds = (quizzes || []).map(q => q.id_quiz);
    const exerciseIds = (exercises || []).map(e => e.id_exercise);

    // 2. Verificar qué completó el usuario
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
      .eq("status", "completed")
      .in("id_quiz", quizIds);

    const { data: userExercises } = await supabase
      .from("users_exercises")
      .select("id_exercise")
      .eq("id_user", id_user)
      .eq("status", "completed")
      .in("id_exercise", exerciseIds);

    // 3. Comparar longitudes
    const allTheories = (userTheories || []).length === theoryIds.length;
    const allQuizzes = (userQuizzes || []).length === quizIds.length;
    const allExercises = (userExercises || []).length === exerciseIds.length;

    if (allTheories && allQuizzes && allExercises) {
      // 4. Marcar progreso como COMPLETADO
      await supabase
        .from("progress")
        .update({ status: 2, endat: new Date().toISOString() })
        .eq("id_user", id_user)
        .eq("id_level", id_level);

      // 5. Buscar el achievement asociado al nivel
      const { data: achievement } = await supabase
        .from("achievements")
        .select("id_achievement")
        .eq("id_level", id_level)
        .maybeSingle();

      // 6. Insertar logro si existe
      if (achievement) {
        await supabase
          .from("users_achievements")
          .upsert(
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
        achievement: achievement ? achievement.id_achievement : null
      });
    }

    // 🚨 Si aún falta contenido
    return res.status(200).json({
      message: "⏳ Nivel aún en progreso",
      pending: {
        theories: theoryIds.length - (userTheories?.length || 0),
        quizzes: quizIds.length - (userQuizzes?.length || 0),
        exercises: exerciseIds.length - (userExercises?.length || 0)
      }
    });

  } catch (error) {
    console.error("Error en checkLevelCompletion:", error);
    return res.status(500).json({ error: "Error al validar el nivel" });
  }
};

/*
🔹 Cómo funciona
El usuario intenta el ejercicio.
Si falla 2 veces seguidas, la IA da un hint.
Si hay coins suficientes, se descuentan.
Si acierta, gana XP y coins normalmente.
Todo queda registrado en la base de datos.
*/
// 5️⃣ Intentar un ejercicio con hints IA
// 5️⃣ Intento de ejercicio con hints registrados
export const attemptExercise = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_exercise, code, stdout, stderr, passed, score, runtime_ms } = req.body;

    // 1️⃣ Guardar intento en exercise_attempts
    const { data: attempt, error: attemptErr } = await supabase
      .from("exercise_attempts")
      .insert([{
        id_user,
        id_exercise,
        code: code || null,
        stdout: stdout || null,
        stderr: stderr || null,
        passed,
        score: score || null,
        runtime_ms: runtime_ms || null
      }])
      .select()
      .single();

    if (attemptErr) return res.status(500).json({ error: "Error saving attempt" });

    // 2️⃣ Contar los últimos 3 intentos fallidos
    const { data: recentAttempts } = await supabase
      .from("exercise_attempts")
      .select("*")
      .eq("id_user", id_user)
      .eq("id_exercise", id_exercise)
      .order("created_at", { ascending: false })
      .limit(3);

    const fails = recentAttempts.filter(a => !a.passed).length;

    // 3️⃣ Determinar si se debe activar hint
    let hint = null;
    let hintCost = 0;
    if (!passed && fails >= 2) {
      // Obtener coins del usuario
      const { data: user } = await supabase
        .from("users")
        .select("coins")
        .eq("id_user", id_user)
        .single();

      hintCost = 5; // ejemplo: 5 coins por hint
      if (user.coins >= hintCost) {
        // Llamada a OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system", content:
                `" You are a programming coach in a gamified learning platform. 
            Your goal is to help the student understand why their code may be failing without giving the exact solution. 
            - Give hints and explanations.
            - Focus on logic, syntax, and common mistakes.
            - Do not provide the full solution.
            - Be encouraging and motivational.
            - Keep hints short, clear, and actionable.
            - Only provide hints when requested or after 2 failed attempts.
            - Mention if coins will be spent for this hint.
            " `},
            { role: "user", content: `El estudiante falló el ejercicio ${id_exercise}. Ayúdalo a entender por qué sin dar la solución exacta.` }
          ]
        });
        hint = response.choices[0].message.content;

        // 3a️⃣ Guardar hint en la tabla users_hints
        await supabase
          .from("users_hints")
          .insert([{
            id_user,
            id_exercise,
            hint,
            cost: hintCost,
            created_at: new Date().toISOString()
          }]);

        // 3b️⃣ Restar coins
        await supabase.rpc("increment_user_rewards", {
          p_id_user: id_user,
          p_xp: 0,
          p_coins: -hintCost
        });
      } else {
        hint = "No tienes suficientes coins para recibir un hint.";
      }
    }

    // 4️⃣ Guardar completado en users_exercises si pasa por primera vez
    let first_time = false;
    let xp_earned = 0;
    let coins_earned = 0;

    if (passed) {
      const { data: exists } = await supabase
        .from("users_exercises")
        .select("*")
        .eq("id_user", id_user)
        .eq("id_exercise", id_exercise)
        .maybeSingle();

      if (!exists) {
        const { data: exercise } = await supabase
          .from("exercises")
          .select("xp_reward, coins_reward")
          .eq("id_exercise", id_exercise)
          .maybeSingle();

        xp_earned = exercise?.xp_reward || 50;
        coins_earned = exercise?.coins_reward || 10;
        first_time = true;

        await supabase
          .from("users_exercises")
          .insert([{ id_user, id_exercise, completed_at: new Date().toISOString() }]);

        await supabase.rpc("increment_user_rewards", {
          p_id_user: id_user,
          p_xp: xp_earned,
          p_coins: coins_earned
        });
      }
    }

    // 5️⃣ Responder al frontend
    return res.status(201).json({
      message: passed ? "Ejercicio completado" : "Intento registrado",
      attempt,
      first_time,
      xp_earned,
      coins_earned,
      hint,
      hintCost
    });

  } catch (err) {
    console.error("Error in attemptExercise:", err);
    return res.status(500).json({ error: "Error in attemptExercise" });
  }
};
