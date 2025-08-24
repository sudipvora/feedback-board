const express = require('express');
const { getPool } = require('../config/database');
const { validateFeedback } = require('../middleware/validation');

const router = express.Router();

// POST /feedback - Save a new feedback entry
router.post('/', validateFeedback, async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    const pool = getPool();
    
    const [result] = await pool.execute(
      'INSERT INTO feedback (name, message, rating) VALUES (?, ?, ?)',
      [name, message, rating]
    );

    // Fetch the created feedback entry
    const [rows] = await pool.execute(
      'SELECT * FROM feedback WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /feedback - Retrieve all feedback entries with optional sorting
router.get('/', async (req, res) => {
  try {
    const { sortBy = 'created_at', order = 'desc' } = req.query;
    const pool = getPool();
    
    // Validate sort parameters
    const allowedSortFields = ['rating', 'created_at', 'name'];
    const allowedOrders = ['asc', 'desc'];
    
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sort field. Allowed values: rating, created_at, name'
      });
    }
    
    if (!allowedOrders.includes(order.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order. Allowed values: asc, desc'
      });
    }

    // Build query with sorting
    const query = `
      SELECT id, name, message, rating, created_at, updated_at
      FROM feedback 
      ORDER BY ${sortBy} ${order.toUpperCase()}
    `;

    const [rows] = await pool.execute(query);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router; 