import express from 'express';
// የሰራነውን core-engine middleware እዚህ እንጠራዋለን
import { securityInspector } from '../core-engine/src/index.js';

const app = express();
const PORT = 4000;

app.use(express.json());

// 1. መላ ጥያቄዎችን በ core-engine እንዲመረመሩ ማድረግ
app.use(securityInspector);

// 2. ተራ የመተግበሪያ ኤንድፖይንቶች
app.get('/api/products', (req, res) => {
  res.json({ message: 'Success', items: ['Laptop', 'Phone', 'Tablet'] });
});

app.post('/api/login', (req, res) => {
  res.json({ message: 'Login successful' });
});

app.listen(PORT, () => {
  console.log(`Demo application running on http://localhost:${PORT}`);
});