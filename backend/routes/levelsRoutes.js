import express from 'express';
import { getLanguages, getLevelsByLanguage } from '../controllers/authlevels.js';


const router = express.Router();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Todo OK en Levels'})
});

router.get('/languages', getLanguages);
router.get('/languages/:id_language/levels', getLevelsByLanguage);
export const levelsRouter = router;