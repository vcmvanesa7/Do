import db from '../config/db.js';

// GET /levels
export const getAllLevels = async (req, res) => {
  try {
    const { data, error } = await db
      .from('level')
      .select('id_level, name, description, step, id_courses, finished')
      .order('id_courses', { ascending: true })
      .order('step', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('getAllLevels error', error);
    res.status(500).json({ error: 'Error al obtener los niveles' });
  }
};

// GET /levels/:id_level
export const getLevelById = async (req, res) => {
  const { id_level } = req.params;

  try {
    const { data, error } = await db
      .from('level')
      .select('id_level, name, description, step, id_courses, finished')
      .eq('id_level', id_level)
      .single(); // solo un registro

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('getLevelById error', error);
    res.status(500).json({ error: 'Error al obtener el nivel' });
  }
};

// GET /levels/course/:id_course
export const getLevelsByCourse = async (req, res) => {
  const { id_course } = req.params;

  try {
    const { data, error } = await db
      .from('level')
      .select('*')
      .eq('id_courses', id_course)
      .order('step', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: `No se encontraron niveles para el curso con id ${id_course}` });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('getLevelsByCourse error', error);
    res.status(500).json({ error: 'Error al obtener los niveles del curso' });
  }
};

// CREATE /levels
export const createLevel = async (req, res) => {
  const { name, description, step, id_courses, finished } = req.body;

  if (!name || !id_courses) {
    return res.status(400).json({ error: 'Nombre y id_courses son obligatorios' });
  }

  try {
    const { data, error } = await db
      .from('level')
      .insert([{ name, description, step, id_courses, finished }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('createLevel error', error);
    res.status(500).json({ error: 'Error al crear el nivel' });
  }
};

// UPDATE /levels/:id_level
export const updateLevel = async (req, res) => {
  const { id_level } = req.params;
  const { name, description, step, finished } = req.body;

  try {
    const { data, error } = await db
      .from('level')
      .update({ name, description, step, finished })
      .eq('id_level', id_level)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('updateLevel error', error);
    res.status(500).json({ error: 'Error al actualizar el nivel' });
  }
};

// DELETE /levels/:id_level
export const deleteLevel = async (req, res) => {
  const { id_level } = req.params;

  try {
    const { error } = await db
      .from('level')
      .delete()
      .eq('id_level', id_level);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('deleteLevel error', error);
    res.status(500).json({ error: 'Error al eliminar el nivel' });
  }
};
