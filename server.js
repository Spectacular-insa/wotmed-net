const express = require('express');
const wotmedDefense = require('./middleware/wotmedDefense');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount Wotmed-Net Active Defense Middleware globally
app.use(wotmedDefense);

// Normal Public Route (Safe traffic passes through)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Wotmed-Net Protected Application Gateway',
    status: 'operational'
  });
});

// Mock Vulnerable Endpoint for Testing Attacks
app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user_role: 'standard'
  });
});

app.listen(PORT, () => {
  console.log(`[Wotmed-Net Edge Gateway]: Running on port ${PORT}`);
});