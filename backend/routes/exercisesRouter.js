<<<<<<< HEAD
import express from 'express';
import { attemptExercise } from '../controllers/progressController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint para intentar un ejercicio
router.post('/attempt', authMiddleware, attemptExercise);

// (opcional) Endpoint para obtener un ejercicio por ID
import supabase from '../config/db.js';
router.get('/:id_exercise', authMiddleware, async (req, res) => {
    const id_exercise = Number(req.params.id_exercise);
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id_exercise', id_exercise)
        .maybeSingle();
    if (error || !data) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ data });
});

=======
import express from 'express';
import { attemptExercise } from '../controllers/progressController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint para intentar un ejercicio
router.post('/attempt', authMiddleware, attemptExercise);

// (opcional) Endpoint para obtener un ejercicio por ID
import supabase from '../config/db.js';
router.get('/:id_exercise', authMiddleware, async (req, res) => {
    const id_exercise = Number(req.params.id_exercise);
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id_exercise', id_exercise)
        .maybeSingle();
    if (error || !data) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ data });
});

>>>>>>> Juanda
export const exercisesRouter = router;