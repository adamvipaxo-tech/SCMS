const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/dashboard', async (_req, res) => {
  try {
    const [[suppliers]] = await pool.query('SELECT COUNT(*) AS count FROM supplier');
    const [[shipments]] = await pool.query('SELECT COUNT(*) AS count FROM shipment');
    const [[deliveries]] = await pool.query('SELECT COUNT(*) AS count FROM delivery');
    const [recentShipments] = await pool.query(
      `SELECT shipmentNumber, shipmentStatus, destination, shipmentDate
       FROM shipment ORDER BY shipmentDate DESC LIMIT 5`
    );
    res.json({
      success: true,
      stats: {
        suppliers: suppliers.count,
        shipments: shipments.count,
        deliveries: deliveries.count,
      },
      recentShipments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

function dateRange(period) {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  let start;

  if (period === 'daily') {
    start = end;
  } else if (period === 'weekly') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    start = d.toISOString().slice(0, 10);
  } else if (period === 'monthly') {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    start = d.toISOString().slice(0, 10);
  } else {
    return null;
  }
  return { start, end };
}

router.get('/:entity/:period', async (req, res) => {
  try {
    const { entity, period } = req.params;
    const range = dateRange(period);
    if (!range) {
      return res.status(400).json({
        success: false,
        message: 'Period must be daily, weekly, or monthly',
      });
    }

    let data = [];
    let summary = {};

    if (entity === 'suppliers') {
      const [rows] = await pool.query(
        `SELECT supplierCode, supplierName, telephone, address, email, created_at AS createdAt
         FROM supplier WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC`,
        [range.start, range.end]
      );
      data = rows;
      summary = { total: rows.length, period, entity: 'Suppliers' };
    } else if (entity === 'shipments') {
      const [rows] = await pool.query(
        `SELECT s.shipmentNumber, s.shipmentDate, s.shipmentStatus, s.destination,
                sup.supplierName
         FROM shipment s
         JOIN supplier sup ON s.supplierCode = sup.supplierCode
         WHERE s.shipmentDate BETWEEN ? AND ?
         ORDER BY s.shipmentDate DESC`,
        [range.start, range.end]
      );
      const statusCounts = rows.reduce((acc, r) => {
        acc[r.shipmentStatus] = (acc[r.shipmentStatus] || 0) + 1;
        return acc;
      }, {});
      data = rows;
      summary = { total: rows.length, byStatus: statusCounts, period, entity: 'Shipments' };
    } else if (entity === 'deliveries') {
      const [rows] = await pool.query(
        `SELECT d.deliveryCode, d.deliveryDate, d.quantityDelivered, d.deliveryStatus,
                d.shipmentNumber, s.destination
         FROM delivery d
         JOIN shipment s ON d.shipmentNumber = s.shipmentNumber
         WHERE d.deliveryDate BETWEEN ? AND ?
         ORDER BY d.deliveryDate DESC`,
        [range.start, range.end]
      );
      const totalQty = rows.reduce((sum, r) => sum + Number(r.quantityDelivered), 0);
      data = rows;
      summary = { total: rows.length, totalQuantity: totalQty, period, entity: 'Deliveries' };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Entity must be suppliers, shipments, or deliveries',
      });
    }

    res.json({
      success: true,
      period,
      dateRange: range,
      summary,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
