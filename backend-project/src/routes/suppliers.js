const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// INSERT only for suppliers (per exam requirements)
router.post('/', async (req, res) => {
  try {
    const { supplierCode, supplierName, telephone, address, email } = req.body;
    if (!supplierCode || !supplierName || !telephone || !address || !email) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    await pool.query(
      `INSERT INTO supplier (supplierCode, supplierName, telephone, address, email)
       VALUES (?, ?, ?, ?, ?)`,
      [supplierCode, supplierName, telephone, address, email]
    );
    res.status(201).json({ success: true, message: 'Supplier registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Supplier code already exists' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Read-only list for dropdowns and reports
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT supplierCode, supplierName, telephone, address, email, created_at AS createdAt FROM supplier ORDER BY supplierName'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
