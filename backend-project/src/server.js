const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const supplierRoutes = require('./routes/suppliers');
const shipmentRoutes = require('./routes/shipments');
const deliveryRoutes = require('./routes/deliveries');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'SCMS API is running', company: 'SupplyNet Ltd' });
});

app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

async function ensureDefaultUser() {
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', ['officer']);
    if (!rows.length) {
      const hash = await bcrypt.hash('supplynet2026', 10);
      await pool.query(
        'INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)',
        ['officer', hash, 'Procurement Officer']
      );
      console.log('Default admin account created on first startup');
    }
  } catch (err) {
    console.warn('Could not seed default user (database may not be ready):', err.message);
  }
}

app.listen(PORT, async () => {
  await ensureDefaultUser();
  console.log(`SupplyNet SCMS API running on http://localhost:${PORT}`);
});
