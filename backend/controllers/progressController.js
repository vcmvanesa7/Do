// Do/backend/controllers/progressController.js
//Este código es un controlador en Express para manejar el progreso de un usuario 
// en los niveles de un curso.

import db from '../config/db.js';

/*
 status:
 0 = pending
 1 = in_progress
 2 = completed
 3 = failed
*/

export const startLevel = async (req, res) => {
  const { id_user, id_level } = req.body;
  if (!id_user || !id_level) return res.status(400).json({ error: 'id_user e id_level requeridos' });

  try {
    // buscar si ya existe progreso
    const { data: existing, error: selErr } = await db
      .from('progress')
      .select('*')
      .eq('id_user', id_user)
      .eq('id_level', id_level)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing) {
      const { data, error } = await db
        .from('progress')
        .update({ status: 1, startAt: new Date().toISOString() })
        .eq('id_progress', existing.id_progress)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    } else {
      const { data, error } = await db
        .from('progress')
        .insert({ id_user, id_level, startAt: new Date().toISOString(), status: 1 })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
  } catch (error) {
    console.error('startLevel error', error);
    res.status(500).json({ error: 'Error al iniciar el nivel' });
  }
};

export const finishLevel = async (req, res) => {
  const { id_user, id_level, status = 2 } = req.body;
  if (!id_user || !id_level) return res.status(400).json({ error: 'id_user e id_level requeridos' });

  try {
    const { data, error } = await db
      .from('progress')
      .update({ status, endAt: new Date().toISOString() })
      .eq('id_user', id_user)
      .eq('id_level', id_level)
      .select()
      .single();
    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    console.error('finishLevel error', error);
    res.status(500).json({ error: 'Error al completar el nivel' });
  }
};

export const getProgressByUserCourse = async (req, res) => {
  const { id_user, id_courses } = req.params;
  try {
    // total niveles del curso
    const { data: totalLevels, error: tErr } = await db
      .from('level')
      .select('id_level')
      .eq('id_courses', id_courses);
    if (tErr) throw tErr;

    // niveles completados por usuario (status = 2)
    const { data: done, error: dErr } = await db
      .from('progress')
      .select('id_level')
      .eq('id_user', id_user)
      .eq('status', 2);
    if (dErr) throw dErr;

    const total = totalLevels ? totalLevels.length : 0;
    const completed = done ? done.length : 0;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.status(200).json({ id_user, id_courses, total, completed, percentage });
  } catch (error) {
    console.error('getProgressByUserCourse', error);
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
};