const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// POST route to call the insert_borrowing procedure
router.post('/', (req, res) => {
  const { member_id, book_id, borrow_date, due_date, return_date } = req.body;

  const sql = `CALL insert_borrowing(?, ?, ?, ?, ?)`;
  const params = [member_id, book_id, borrow_date, due_date, return_date];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error executing procedure:', err);
      return res.status(500).json({ error: 'Failed to insert borrowing record' });
    }

    res.status(200).json({ message: 'Borrowing record inserted successfully' });
  });
});

module.exports = router;
