const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.shipmentNumber, s.shipmentDate, s.shipmentStatus, s.destination,
             s.supplierCode, sup.supplierName, s.created_at AS createdAt
      FROM shipment s
      JOIN supplier sup ON s.supplierCode = sup.supplierCode
      ORDER BY s.shipmentDate DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:shipmentNumber', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, sup.supplierName FROM shipment s
       JOIN supplier sup ON s.supplierCode = sup.supplierCode
       WHERE s.shipmentNumber = ?`,
      [req.params.shipmentNumber]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { shipmentNumber, shipmentDate, shipmentStatus, destination, supplierCode } = req.body;
    if (!shipmentNumber || !shipmentDate || !destination || !supplierCode) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    await pool.query(
      `INSERT INTO shipment (shipmentNumber, shipmentDate, shipmentStatus, destination, supplierCode)
       VALUES (?, ?, ?, ?, ?)`,
      [shipmentNumber, shipmentDate, shipmentStatus || 'Pending', destination, supplierCode]
    );
    res.status(201).json({ success: true, message: 'Shipment created successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Shipment number already exists' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Invalid supplier code' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:shipmentNumber', async (req, res) => {
  try {
    const { shipmentDate, shipmentStatus, destination, supplierCode } = req.body;
    const [result] = await pool.query(
      `UPDATE shipment SET shipmentDate=?, shipmentStatus=?, destination=?, supplierCode=?
       WHERE shipmentNumber=?`,
      [shipmentDate, shipmentStatus, destination, supplierCode, req.params.shipmentNumber]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    res.json({ success: true, message: 'Shipment updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:shipmentNumber', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM shipment WHERE shipmentNumber = ?', [
      req.params.shipmentNumber,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }
    res.json({ success: true, message: 'Shipment deleted successfully' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete: deliveries exist for this shipment',
      });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
