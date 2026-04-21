// controllers/auth.controller.js
const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    console.log('Registering user:', email, role);
    const user = await authService.register({ name, email, password, role });
    res.status(201).json({ message: 'Registered successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log('Logging in user:', email);
    
    const data = await authService.login({ email, password });
    res.json(data);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

module.exports = { register, login };
