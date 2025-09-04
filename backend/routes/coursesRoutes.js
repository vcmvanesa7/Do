<<<<<<< HEAD
// routes/courses.js
import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/authcourses.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD de cursos con mismos endpoints que tu código original

// Listar todos los cursos → user y admin
router.get("/", authMiddleware, roleMiddleware(["user", "admin"]), getCourses);

// Ver un curso → user y admin
router.get("/:id_courses", authMiddleware, roleMiddleware(["user", "admin"]), getCourseById);

// Crear curso → solo admin
router.post("/", authMiddleware, roleMiddleware(["admin"]), createCourse);

// Actualizar curso → solo admin
router.put("/:id_courses", authMiddleware, roleMiddleware(["admin"]), updateCourse);

// Eliminar curso → solo admin
router.delete("/:id_courses", authMiddleware, roleMiddleware(["admin"]), deleteCourse);

export const coursesRouter = router;

=======
// routes/courses.js
import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/authcourses.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD de cursos con mismos endpoints que tu código original

// Listar todos los cursos → user y admin
router.get("/", authMiddleware, roleMiddleware(["user", "admin"]), getCourses);

// Ver un curso → user y admin
router.get("/:id_courses", authMiddleware, roleMiddleware(["user", "admin"]), getCourseById);

// Crear curso → solo admin
router.post("/", authMiddleware, roleMiddleware(["admin"]), createCourse);

// Actualizar curso → solo admin
router.put("/:id_courses", authMiddleware, roleMiddleware(["admin"]), updateCourse);

// Eliminar curso → solo admin
router.delete("/:id_courses", authMiddleware, roleMiddleware(["admin"]), deleteCourse);

export const coursesRouter = router;

>>>>>>> Juanda
