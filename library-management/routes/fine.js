const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // Your DB connection module

// Get all staff members
router.get('/', (req, res) => {
  db.query('SELECT * FROM Fine', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) {
      return res.status(404).json({ message: 'No fine records found.' });
    }
    res.json(results);
  });
});

module.exports = router;
