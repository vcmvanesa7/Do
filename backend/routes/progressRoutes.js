// routes/progressRoutes.js
import express from 'express';
import { startLevel, finishLevel, getProgressByUserCourse } from '../controllers/progressController.js';

const router = express.Router();

router.post('/start', startLevel);        
router.post('/finish', finishLevel);      
router.get('/:id_user/:id_courses', getProgressByUserCourse);

export default router;
