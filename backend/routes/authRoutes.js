import express from 'express';
import { Register,Login } from '../controllers/authControllers.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Todo OK en Auth'})
})

router.post('/register', Register);
router.post('/login',Login);

//ruta protegida

router.get("/me",authMiddleware, (req,res) => {
    res.json({message:"User data", user: req.user});
});


export const authRouter = router;