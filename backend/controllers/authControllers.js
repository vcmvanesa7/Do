import { validationResult } from "express-validator";   // Importa validationResult para manejar errores de validación
import bcrypt from "bcryptjs";                          // Importa bcryptjs para hashear contraseñas
import supabase from "../config/db.js";                 // Importa la configuración de Supabase  
import { generateToken } from "../config/jwt.js";      // Importa la función para generar tokens JWT

// REGISTER
export const Register = async (req, res) => {   // Controlador para registrar un nuevo usuario
  try {
    const errors = validationResult(req);       // Verifica si hay errores de validación
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); // Si hay errores, responde con estado 400 y los errores

    const { nombre, email, password } = req.body;     // Extrae nombre, email y password del cuerpo de la solicitud

    const { data: existingUser, error: findError } = await supabase   // Verifica si el email ya está registrado
      .from("users")  //nombre de la tabla en Supabase
      .select("*")  // Selecciona todos los campos
      .eq("email", email) // Filtra por email
      .single();  //espera un solo resultado

    // Si hay un error en la consulta que no sea "no encontrado", responde con estado 500
    if (findError && findError.code !== "PGRST116") return res.status(500).json({ error: findError.message });
    // Si ya existe un usuario con ese email, responde con estado 400
    if (existingUser) return res.status(400).json({ error: "El email ya está registrado" });

    // Hashea la contraseña antes de guardarla en la base de datos
    //10 es el número de rondas de salting (más alto es más seguro pero más lento)
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const { data, error: insertError } = await supabase //“espera la respuesta de Supabase, guárdame los datos en data y el error (si existe) en insertError”.
      .from("users") 
      .insert([{ name: nombre, email, pass: hashedPassword }]) // Inserta el nuevo usuario
      .select() // Selecciona los datos insertados
      .single(); 

    // Si hay un error al insertar, responde con estado 500      
    if (insertError) return res.status(500).json({ error: insertError.message });

    const token = generateToken(data);  // Genera un token JWT para el nuevo usuario

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
