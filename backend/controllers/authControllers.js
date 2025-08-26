import supabase from '../config/db.js';

export const Register = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: "email y password requeridos" })
  
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return res.status(400).json({ error })
    res.json(data)
}

// Login (ejemplo: devuelve session)
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body
//   if (!email || !password) return res.status(400).json({ error: "email y password requeridos" })

//   const { data, error } = await supabase.auth.signInWithPassword({ email, password })
//   if (error) return res.status(400).json({ error })
//   res.json(data)
// })