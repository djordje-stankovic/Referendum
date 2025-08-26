// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase'); // Ispravljen uvoz

router.post('/api/auth/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password, first_name, last_name }) // Napomena: Hashuj lozinku u produkciji!
    .select();
  if (error) return res.status(400).json({ error: error.message });
  const token = jwt.sign({ id: data[0].id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: data[0] });
});

router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password) // Napomena: Koristi hash-ovanje lozinke!
    .single();
  if (error || !data) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: data.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: data });
});

router.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: { id: decoded.id, email: decoded.email } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;