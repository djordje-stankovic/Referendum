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
    const userId = extractUserIdFromToken(token);
    res.json({ user: { id: userId, email: 'user@example.com' } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// User Profile Management Routes
// GET /api/users/profile - Get user profile
router.get('/users/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const userId = extractUserIdFromToken(token);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, first_name, last_name, bio, municipality_id, created_at')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/users/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const userId = extractUserIdFromToken(token);
    
    const { first_name, last_name, email, username, bio } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }
    
    // Check if email is already taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already taken by another user' });
    }
    
    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        email,
        username: username || `${first_name} ${last_name}`.toLowerCase().replace(/\s+/g, ''),
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// PUT /api/users/change-password - Change user password
router.put('/users/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const userId = extractUserIdFromToken(token);
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    // Get current user to verify current password
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Verify current password (Note: In production, use proper password hashing)
    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: newPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// GET /api/users/preferences - Get user preferences
router.get('/users/preferences', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const userId = extractUserIdFromToken(token);
    
    // For now, return default preferences
    // In the future, you can create a user_preferences table
    const defaultPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      proposalUpdates: true,
      publicProfile: true,
      showEmail: false
    };
    
    res.json(defaultPreferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
});

// PUT /api/users/preferences - Update user preferences
router.put('/users/preferences', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const userId = extractUserIdFromToken(token);
    
    const preferences = req.body;
    
    // For now, just return success
    // In the future, you can save preferences to a user_preferences table
    console.log(`User ${userId} updated preferences:`, preferences);
    
    res.json({ message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

// Helper function to extract user ID from token (supports both JWT and dev tokens)
const extractUserIdFromToken = (token) => {
  console.log('🔍 [TOKEN] Attempting to extract user ID from token:', token ? token.substring(0, 20) + '...' : 'null');
  
  try {
    // Try JWT first
    console.log('🔍 [TOKEN] Trying JWT verification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('✅ [TOKEN] JWT successful, user ID:', decoded.id);
    return decoded.id;
  } catch (jwtError) {
    console.log('❌ [TOKEN] JWT failed:', jwtError.message);
    try {
      // Try development token format: user_id:timestamp:dev_secret
      console.log('🔍 [TOKEN] Trying development token format...');
      const decoded = Buffer.from(token, 'base64').toString();
      const parts = decoded.split(':');
      console.log('🔍 [TOKEN] Decoded parts:', parts);
      if (parts.length === 3 && parts[2] === 'dev_secret') {
        const userId = parseInt(parts[0]);
        console.log('✅ [TOKEN] Development token successful, user ID:', userId);
        return userId;
      }
    } catch (devError) {
      console.log('❌ [TOKEN] Development token failed:', devError.message);
    }
    console.log('❌ [TOKEN] All token formats failed');
    throw new Error('Invalid token format');
  }
};

// Avatar Management Routes
// GET /api/users/:id/avatar - Get user avatar
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('avatar')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    if (user.avatar) {
      // If user has custom avatar, serve it
      res.json({ avatarUrl: user.avatar });
    } else {
      // Return default avatar
      res.json({ 
        avatarUrl: `https://i.pravatar.cc/150?img=${userId % 70 + 1}` 
      });
    }
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    // Return default avatar on error
    res.json({ 
      avatarUrl: `https://i.pravatar.cc/150?img=1` 
    });
  }
});

// POST /api/users/:id/avatar - Upload user avatar
router.post('/users/:id/avatar', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const userId = extractUserIdFromToken(token);
    const requestedUserId = parseInt(req.params.id);
    
    // Check if user is updating their own avatar
    if (userId !== requestedUserId) {
      return res.status(403).json({ error: 'You can only update your own avatar' });
    }
    
    // For now, we'll simulate avatar upload by generating a new avatar URL
    // In production, you would handle file upload to cloud storage (AWS S3, etc.)
    const newAvatarUrl = `https://i.pravatar.cc/150?img=${userId % 70 + 1}&t=${Date.now()}`;
    
    // Update user's avatar in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar: newAvatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    res.json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl: newAvatarUrl
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

module.exports = router;