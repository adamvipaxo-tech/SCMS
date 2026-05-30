const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.deliveryCode, d.deliveryDate, d.quantityDelivered, d.deliveryStatus,
             d.shipmentNumber, s.destination, s.shipmentStatus
      FROM delivery d
      JOIN shipment s ON d.shipmentNumber = s.shipmentNumber
      ORDER BY d.deliveryDate DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:deliveryCode', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, s.destination FROM delivery d
       JOIN shipment s ON d.shipmentNumber = s.shipmentNumber
       WHERE d.deliveryCode = ?`,
      [req.params.deliveryCode]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { deliveryCode, deliveryDate, quantityDelivered, deliveryStatus, shipmentNumber } =
      req.body;
    if (!deliveryCode || !deliveryDate || !quantityDelivered || !shipmentNumber) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    await pool.query(
      `INSERT INTO delivery (deliveryCode, deliveryDate, quantityDelivered, deliveryStatus, shipmentNumber)
       VALUES (?, ?, ?, ?, ?)`,
      [
        deliveryCode,
        deliveryDate,
        quantityDelivered,
        deliveryStatus || 'Scheduled',
        shipmentNumber,
      ]
    );
    res.status(201).json({ success: true, message: 'Delivery recorded successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Delivery code already exists' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Invalid shipment number' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:deliveryCode', async (req, res) => {
  try {
    const { deliveryDate, quantityDelivered, deliveryStatus, shipmentNumber } = req.body;
    const [result] = await pool.query(
      `UPDATE delivery SET deliveryDate=?, quantityDelivered=?, deliveryStatus=?, shipmentNumber=?
       WHERE deliveryCode=?`,
      [deliveryDate, quantityDelivered, deliveryStatus, shipmentNumber, req.params.deliveryCode]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    res.json({ success: true, message: 'Delivery updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:deliveryCode', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM delivery WHERE deliveryCode = ?', [
      req.params.deliveryCode,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    res.json({ success: true, message: 'Delivery deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
