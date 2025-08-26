import express from 'express';

const router = express.Router();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Todo OK en exercises'})
})

export const exercisesRouter = router;