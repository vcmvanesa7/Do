// controllers/progressController.js
import db from '../config/db.js';

/*
 status mapping:
 0 = pending
 1 = in_progress
 2 = completed
 3 = failed
*/

// POST /progress/start
export const startLevel = async (req, res) => {
  const { id_user, id_level } = req.body;
  if (!id_user || !id_level) return res.status(400).json({ error: 'id_user e id_level requeridos' });

  try {
    // Verificar si existe
    const existing = await db.query('SELECT * FROM progress WHERE id_user = $1 AND id_level = $2', [id_user, id_level]);

    if (existing.rowCount === 0) {
      await db.query(
        'INSERT INTO progress (id_user, id_level, status, startAt) VALUES ($1, $2, 1, NOW())',
        [id_user, id_level]
      );
    } else {
      // Si ya existe, actualizamos a in_progress si no está terminado
      await db.query(
        `UPDATE progress
         SET status = CASE WHEN status = 2 THEN status ELSE 1 END,
             startAt = COALESCE(startAt, NOW())
         WHERE id_user = $1 AND id_level = $2`,
        [id_user, id_level]
      );
    }

    res.status(200).json({ ok: true, message: 'Nivel iniciado' });
  } catch (error) {
    console.error('startLevel error', error);
    res.status(500).json({ error: 'Error al iniciar el nivel' });
  }
};

// POST /progress/finish
export const finishLevel = async (req, res) => {
  const { id_user, id_level } = req.body;
  if (!id_user || !id_level) return res.status(400).json({ error: 'id_user e id_level requeridos' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Confirmar nivel y courses
    const lvlRes = await client.query('SELECT id_courses, step FROM level WHERE id_level = $1', [id_level]);
    if (lvlRes.rowCount === 0) throw new Error('Nivel no encontrado');

    const { id_courses, step } = lvlRes.rows[0];

    // Upsert progress -> marcar completado (status=2)
    // (Si no tienes UNIQUE(id_user,id_level) en progress, esta sentencia fallará;
    // por eso manejamos con SELECT/INSERT/UPDATE en este controller)
    const existing = await client.query('SELECT * FROM progress WHERE id_user = $1 AND id_level = $2', [id_user, id_level]);
    if (existing.rowCount === 0) {
      await client.query(
        'INSERT INTO progress (id_user, id_level, status, startAt, endAt) VALUES ($1, $2, 2, NOW(), NOW())',
        [id_user, id_level]
      );
    } else {
      await client.query(
        'UPDATE progress SET status = 2, endAt = NOW() WHERE id_user = $1 AND id_level = $2',
        [id_user, id_level]
      );
    }

    // Actualizar users_courses (registro del nivel alcanzado)
    await client.query(
      `INSERT INTO users_courses (id_user, id_courses, level)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_user, id_courses) DO UPDATE SET level = EXCLUDED.level`,
      [id_user, id_courses, step]
    );

    await client.query('COMMIT');

    // calcular porcentaje completado en ese courses
    const totalRes = await db.query('SELECT COUNT(*)::int as total FROM level WHERE id_courses = $1', [id_courses]);
    const doneRes = await db.query(
      `SELECT COUNT(DISTINCT p.id_level)::int as completed
       FROM progress p
       JOIN level l ON p.id_level = l.id_level
       WHERE p.id_user = $1 AND l.id_courses = $2 AND p.status = 2`,
      [id_user, id_courses]
    );

    const total = totalRes.rows[0].total || 0;
    const completed = doneRes.rows[0].completed || 0;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.status(200).json({ ok: true, percentage: percent, completed, total });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('finishLevel error', error);
    res.status(500).json({ error: 'Error al completar el nivel' });
  } finally {
    client.release();
  }
};


// GET /progress/:id_user/:id_courses  -> estado general
export const getProgressByUserCourse = async (req, res) => {
  const { id_user, id_courses } = req.params;
  try {
    const totalRes = await db.query('SELECT COUNT(*)::int as total FROM level WHERE id_courses = $1', [id_courses]);
    const doneRes = await db.query(
      `SELECT COUNT(DISTINCT p.id_level)::int as completed
       FROM progress p
       JOIN level l ON p.id_level = l.id_level
       WHERE p.id_user = $1 AND l.id_courses = $2 AND p.status = 2`,
      [id_user, id_courses]
    );

    const total = totalRes.rows[0].total || 0;
    const completed = doneRes.rows[0].completed || 0;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.status(200).json({ id_user, id_courses, total, completed, percentage: percent });
  } catch (error) {
    console.error('getProgressByUserCourse', error);
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
};
