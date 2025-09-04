<<<<<<< HEAD
import express from "express";
import { check, validationResult } from "express-validator";
import { Register, Login } from "../controllers/authControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import supabase from "../config/db.js";

const router = express.Router();

// ------------------ Rutas públicas ------------------

// Registro de usuario
router.post(
  "/register",
  [
    check("nombre", "El nombre es obligatorio").notEmpty(),
    check("nombre", "El nombre debe tener al menos 3 caracteres").isLength({ min: 3 }),
    check("email", "El email es obligatorio").notEmpty(),
    check("email", "El email no es válido").isEmail(),
    check("password", "La contraseña es obligatoria").notEmpty(),
    check("password", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
  ],
  Register
);

// Login de usuario
router.post(
  "/login",
  [
    check("email", "El email es obligatorio").notEmpty(),
    check("email", "El email no es válido").isEmail(),
    check("password", "La contraseña es obligatoria").notEmpty(),
  ],
  Login
);

// ------------------ Rutas protegidas ------------------

// Obtener datos del usuario
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Datos del usuario",
    user: {
      id: req.user.id_user,
      nombre: req.user.name,
      email: req.user.email,
      avatar: req.user.photoURL || null,
    },
  });
});

// Actualizar perfil del usuario
router.put(
  "/me",
  authMiddleware,
  [
    check("nombre", "El nombre debe tener al menos 3 caracteres").optional().isLength({ min: 3 }),
    check("avatar", "El avatar debe ser una URL válida").optional().isURL(),
  ],
  async (req, res) => {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { nombre, avatar } = req.body;
      if (!nombre && !avatar)
        return res.status(400).json({ error: "Debe enviar al menos un campo" });

      const { data, error } = await supabase
        .from("users")
        .update({ name: nombre || req.user.name, photoURL: avatar || req.user.photoURL })
        .eq("id_user", req.user.id_user)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      res.json({ message: "Perfil actualizado con éxito", user: data });
    } catch (err) {
      res.status(500).json({ error: "Error interno", details: err.message });
    }
  }
);

export const authRouter = router;
=======
import express from "express";
import { check, validationResult } from "express-validator";
import { Register, Login, loginWithGithub, githubCallback } from "../controllers/authControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import supabase from "../config/db.js";

const router = express.Router();

// ------------------ Rutas públicas ------------------

// Registro de usuario normal
router.post(
  "/register",
  [
    check("nombre", "El nombre es obligatorio").notEmpty(),
    check("nombre", "El nombre debe tener al menos 3 caracteres").isLength({ min: 3 }),
    check("email", "El email es obligatorio").notEmpty(),
    check("email", "El email no es válido").isEmail(),
    check("password", "La contraseña es obligatoria").notEmpty(),
    check("password", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
  ],
  Register
);

// Login normal con email/password
router.post(
  "/login",
  [
    check("email", "El email es obligatorio").notEmpty(),
    check("email", "El email no es válido").isEmail(),
    check("password", "La contraseña es obligatoria").notEmpty(),
  ],
  Login
);

// ------------------ GitHub OAuth ------------------

// Iniciar el flujo de login con GitHub
router.get("/github", loginWithGithub);

// Callback de GitHub después de login
router.get("/github/callback", githubCallback);

// ------------------ Rutas protegidas ------------------

// Obtener datos del usuario autenticado
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Datos del usuario",
    user: {
      id: req.user.id_user,
      nombre: req.user.name,
      email: req.user.email,
      avatar: req.user.photoURL || null,
    },
  });
});

// Actualizar perfil del usuario
router.put(
  "/me",
  authMiddleware,
  [
    check("nombre", "El nombre debe tener al menos 3 caracteres").optional().isLength({ min: 3 }),
    check("avatar", "El avatar debe ser una URL válida").optional().isURL(),
  ],
  async (req, res) => {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { nombre, avatar } = req.body;
      if (!nombre && !avatar)
        return res.status(400).json({ error: "Debe enviar al menos un campo" });

      // Actualizar datos en Supabase
      const { data, error } = await supabase
        .from("users")
        .update({
          name: nombre || req.user.name,
          photoURL: avatar || req.user.photoURL,
        })
        .eq("id_user", req.user.id_user)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      res.json({ message: "Perfil actualizado con éxito", user: data });
    } catch (err) {
      res.status(500).json({ error: "Error interno", details: err.message });
    }
  }
);

export const authRouter = router;
>>>>>>> Juanda
