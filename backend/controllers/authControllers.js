<<<<<<< HEAD
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import supabase from "../config/db.js";
import { generateToken } from "../config/jwt.js";

// REGISTER
export const Register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nombre, email, password, role } = req.body; // role opcional

    // Verificar si ya existe el usuario
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (findError && findError.code !== "PGRST116") return res.status(500).json({ error: findError.message });
    if (existingUser) return res.status(400).json({ error: "El email ya está registrado" });

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario con rol por defecto 'user' si no se pasa
    const { data, error: insertError } = await supabase
      .from("users")
      .insert([{ name: nombre, email, pass: hashedPassword, role: role || "user" }])
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });

    // Generar token JWT incluyendo rol
    const token = generateToken(data);

    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: { id: data.id_user, nombre: data.name, email: data.email, role: data.role },
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

    // Generar token JWT incluyendo rol
    const token = generateToken(user);

    res.json({
      message: "Login exitoso",
      user: { id: user.id_user, nombre: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
=======
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import supabase from "../config/db.js";
import { generateToken } from "../config/jwt.js";


// REGISTER

export const Register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nombre, email, password, role } = req.body;

    // Verificar si ya existe el usuario
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (findError && findError.code !== "PGRST116")
      return res.status(500).json({ error: findError.message });

    if (existingUser)
      return res.status(400).json({ error: "El email ya está registrado" });

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const { data, error: insertError } = await supabase
      .from("users")
      .insert([{ name: nombre, email, pass: hashedPassword, role: role || "user" }])
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });

    const token = generateToken(data);

    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: { id: data.id_user, nombre: data.name, email: data.email, role: data.role },
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
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

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
      user: { id: user.id_user, nombre: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// LOGIN CON GITHUB

export const loginWithGithub = async (req, res) => {
  try {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email`;
    res.json({ url: githubAuthUrl });
  } catch (err) {
    res.status(500).json({ error: "Error iniciando login con GitHub", details: err.message });
  }
};


// CALLBACK DE GITHUB

export const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "No se recibió el código de GitHub" });

    // 1️ Obtener accesso_token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
    });
    const { access_token } = await tokenResponse.json();
    if (!access_token) return res.status(400).json({ error: "No se pudo obtener el token de GitHub" });

    //  Obtener datos básicos del usuario
    const githubUser = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${access_token}` },
    }).then(r => r.json());

    //  Obtener emails y validar
    const emails = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `token ${access_token}` },
    }).then(r => r.json());

    const primaryEmail = emails.find(e => e.primary && e.verified)?.email;

    if (!primaryEmail) {
      return res.status(400).json({
        error:
          "No se pudo obtener un email válido de GitHub. Asegúrate de que tu email esté público o verificado.",
        githubUserLogin: githubUser.login,
      });
    }

    // Upsert seguro en Supabase
    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        {
          email: primaryEmail,
          name: githubUser.name || githubUser.login,
          photoURL: githubUser.avatar_url || null,
          provider: "github",
          role: "user", // rol por defecto
          pass: null,   // usuarios OAuth no necesitan password
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    //  Generar JWT
    const token = generateToken(user);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Error en login con GitHub", details: err.message });
  }
};

>>>>>>> Juanda
