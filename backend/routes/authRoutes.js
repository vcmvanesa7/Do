import express from 'express';
import { Register } from '../controllers/authControllers.js';

const router = express.Router();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Todo OK en Auth'})
})

router.post('/register', Register);

export const authRouter = router;