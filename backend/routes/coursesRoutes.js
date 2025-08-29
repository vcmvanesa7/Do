import express from 'express';
import { 
  getCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse 
} from '../controllers/authcourses.js';

const router = express.Router();

// CRUD de cursos
router.get('/', getCourses);
router.get('/:id_course', getCourseById);
router.post('/', createCourse);        // Crear curso
router.put('/:id_course', updateCourse); // Editar curso
router.delete('/:id_course', deleteCourse); // Eliminar curso

export const coursesRouter = router;
