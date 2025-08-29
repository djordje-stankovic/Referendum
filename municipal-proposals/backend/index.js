const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const draftRoutes = require('./routes/draftRoutes');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Omogućava CORS za sve origin-e

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running', timestamp: new Date().toISOString() });
});

app.use('/api', authRoutes);
app.use('/api', proposalRoutes);
app.use('/api', draftRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));