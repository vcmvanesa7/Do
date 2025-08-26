import express from 'express';
import { getCourse, getLevelsByCourse } from '../controllers/authlevels.js';

const router = express.Router();

router.get('/courses', getCourse);
router.get('/courses/:id_courses/levels', getLevelsByCourse);

export const levelsRouter = router;