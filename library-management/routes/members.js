const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // This is your pool

// Get all members
router.get('/', async (req, res) => {
  try {
    console.log('Attempting to connect to database...');
    
    // Test the connection first
    const connection = await db.getConnection();
    console.log('Database connection successful');
    connection.release();
    
    console.log('Executing query: SELECT * FROM MEMBERS');
    const [rows] = await db.query('SELECT * FROM MEMBERS');
    console.log('Query successful, rows found:', rows.length);
    
    // FIXED: Return JSON instead of trying to render template
    res.json({ 
      success: true,
      count: rows.length,
      members: rows 
    });
    
  } catch (err) {
    console.error('Detailed error information:');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack);
    
    res.status(500).json({ 
      error: 'Database error',
      details: err.message,
      code: err.code 
    });
  }
});

// Add new member
router.post('/', async (req, res) => {
  try {
    const { name, memberType, email } = req.body;
    console.log('Inserting member:', { name, memberType, email });
    
    // IMPROVEMENT: Add validation
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Name and email are required fields' 
      });
    }
    
    const [result] = await db.query(
      'INSERT INTO MEMBERS (NAME, MEMBER_TYPE, EMAIL) VALUES (?, ?, ?)',
      [name, memberType, email]
    );
    
    res.status(201).json({ 
      message: 'Member added successfully', 
      memberId: result.insertId 
    });
    
  } catch (error) {
    console.error('Insert error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;