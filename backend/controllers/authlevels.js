// controllers/levelsController.js
import db from '../config/db.js';

/**
 * GET /courses
 */
export const getCourse = async (req, res) => {
  try {
    const { data, error } = await db.from('courses').select('*').order('name', { ascending: true });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('getCourse error', error);
    res.status(500).json({ error: 'Error al obtener los Courses' });
  }
};

/**
 * GET /courses/:id/levels?userId=...
 * Devuelve los niveles del course con flags: finished, isUnlocked
 */
export const getLevelsByCourse = async (req, res) => {
  const { id_courses } = req.params;
  // userId: se puede pasar por query o por header (cuando tengas auth real usar token)
  const userId = req.query.userId || req.header('x-user-id') || null;

  try {
    // 1) Traer niveles ordenados
    const { data: levels, error: levelsError } = await db
      .from('level')
      .select('id_level, name, description, step')
      .eq('id_courses', id_courses)
      .order('step', { ascending: true });
    if (levelsError) throw levelsError;

    if (!levels.length) return res.status(200).json({ coursesId: +id_courses, levels: [] });

    // 2) Traer progreso del usuario para esos niveles (si no hay userId, progressRows = [])
    let progressRows = [];
    if (userId) {
      const levelIds = levels.map(l => l.id_level);
      const { data: progressRows, error: progressError } = await db
        .from('progress')
        .select('id_level, status')
        .eq('id_user', userId)
        .in('id_level', levelIds);
      if (progressError) throw progressError;
      progressRows = progressRows;
    }

    const progMap = new Map(progressRows.map(p => [p.id_level, p.status]));

    // 3) Lógica de desbloqueo: primer nivel desbloqueado; siguiente desbloqueado solo si anterior finished (status==2)
    // status mapping: 0=pending,1=in_progress,2=completed,3=failed
    let unlocked = true;
    const levelsWithFlags = levels.map(lvl => {
      const status = progMap.get(lvl.id_level); // puede ser undefined
      const finished = status === 2;
      const isUnlocked = unlocked;
      // Si este nivel NO está terminado, los siguientes se bloquean
      if (!finished) unlocked = false;
      return {
        id_level: lvl.id_level,
        name: lvl.name,
        description: lvl.description,
        step: lvl.step,
        finished: !!finished,
        isUnlocked
      };
    });

    res.status(200).json({ coursesId: +id_courses, levels: levelsWithFlags, userId: userId || null });
  } catch (error) {
    console.error('getLevelsByCourse error', error);
    res.status(500).json({ error: 'Error al obtener los niveles' });
  }
};
