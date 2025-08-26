// routes/progressRoutes.js
import express from 'express';
import { startLevel, finishLevel, getProgressByUserLanguage } from '../controllers/progressController.js';

const router = express.Router();

router.post('/start', startLevel);        // body: { id_user, id_level }
router.post('/finish', finishLevel);      // body: { id_user, id_level }
router.get('/:id_user/:id_language', getProgressByUserLanguage);

export default router;
