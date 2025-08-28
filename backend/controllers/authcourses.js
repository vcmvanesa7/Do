// controllers/authcourses.js
import db from '../config/db.js';

// GET /courses → todos los cursos
export const getCourses = async (req, res) => {
  try {
    const { data, error } = await db
      .from('courses')
      .select('id_courses, name, description')
      .order('name', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('getCourses error', error);
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
};

// GET /courses/:id_course → curso específico
export const getCourseById = async (req, res) => {
  const { id_course } = req.params;

  try {
    const { data, error } = await db
      .from('courses')
      .select('id_courses, name, description')
      .eq('id_courses', id_course)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: `No se encontró el curso con id ${id_course}` });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('getCourseById error', error);
    res.status(500).json({ error: 'Error al obtener el curso' });
  }
};

// CREATE /courses
export const createCourse = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre del curso es obligatorio' });
  }

  try {
    const { data, error } = await db
      .from('courses')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('createCourse error', error);
    res.status(500).json({ error: 'Error al crear el curso' });
  }
};

// UPDATE /courses/:id_course
export const updateCourse = async (req, res) => {
  const { id_course } = req.params;
  const { name, description } = req.body;

  try {
    const { data, error } = await db
      .from('courses')
      .update({ name, description })
      .eq('id_courses', id_course)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('updateCourse error', error);
    res.status(500).json({ error: 'Error al actualizar el curso' });
  }
};

// DELETE /courses/:id_course
export const deleteCourse = async (req, res) => {
  const { id_course } = req.params;

  try {
    const { error } = await db
      .from('courses')
      .delete()
      .eq('id_courses', id_course);

    if (error) throw error;
    res.status(204).send(); // No devuelve contenido
  } catch (error) {
    console.error('deleteCourse error', error);
    res.status(500).json({ error: 'Error al eliminar el curso' });
  }
};