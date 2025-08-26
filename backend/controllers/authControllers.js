import supabase from "../config/db.js";
import { generateToken } from "../config/jwt.js";


// Registration logic
export const Register = async (req, res) => {
  const { email, password } = req.body; 
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }   
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: "User created successfully", user: data.user });
};

// Login logic
export const Login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  // Generar JWT propio
  const token = generateToken({ id: data.user.id, email: data.user.email });

  res.json({ message: "Successful login", token });
};