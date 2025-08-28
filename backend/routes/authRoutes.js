// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase'); // Ispravljen uvoz

// GET /api/municipalities - Endpoint za učitavanje opština
router.get('/municipalities', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('municipalities')
      .select('id, name, code, region')
      .order('name');
    
    if (error) {
      console.error('Error fetching municipalities:', error);
      return res.status(500).json({ error: 'Failed to fetch municipalities' });
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Error in municipalities endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  const { email, password, first_name, last_name, municipality_id } = req.body;
  
  try {
    // Generiši username od first_name + last_name
    const username = `${first_name} ${last_name}`.toLowerCase().replace(/\s+/g, '');
    
    const { data, error } = await supabase
      .from('users')
      .insert({ 
        username,
        email, 
        password, 
        first_name, 
        last_name, 
        municipality_id 
      })
      .select();
      
    if (error) {
      console.error('Registration error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    const token = jwt.sign({ id: data[0].id, email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    res.json({ token, user: data[0] });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
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

router.get('/me', (req, res) => {
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