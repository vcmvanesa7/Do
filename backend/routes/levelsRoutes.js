import express from 'express';
import { 
  getAllLevels, 
  getLevelsByCourse, 
  getLevelById,
  createLevel, 
  updateLevel, 
  deleteLevel 
} from '../controllers/authlevels.js';

const router = express.Router();

// CRUD de niveles
router.get('/', getAllLevels);
router.get('/:id_level', getLevelById);
router.get('/course/:id_course', getLevelsByCourse);
router.post('/', createLevel);
router.put('/:id_level', updateLevel);
router.delete('/:id_level', deleteLevel);

export const levelsRouter = router;