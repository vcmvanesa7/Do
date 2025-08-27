import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import supabase from "../config/db.js";
import { generateToken } from "../config/jwt.js";

// REGISTER
export const Register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nombre, email, password } = req.body;

    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (findError && findError.code !== "PGRST116") return res.status(500).json({ error: findError.message });
    if (existingUser) return res.status(400).json({ error: "El email ya está registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error: insertError } = await supabase
      .from("users")
      .insert([{ name: nombre, email, pass: hashedPassword }])
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });

    const token = generateToken(data);

    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: { id: data.id_user, nombre: data.name, email: data.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
export const Login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (findError) return res.status(400).json({ error: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.pass);
    if (!isMatch) return res.status(400).json({ error: "Credenciales inválidas" });

    const token = generateToken(user);

    res.json({
      message: "Login exitoso",
      user: { id: user.id_user, nombre: user.name, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
