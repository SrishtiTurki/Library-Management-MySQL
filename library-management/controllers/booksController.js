const db = require('../db/connection');

exports.getBooks = (req, res) => {
  db.query('SELECT * FROM BOOKS', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.addBook = (req, res) => {
  const { title, author, genre, year } = req.body;
  const query = 'INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)';
  db.query(query, [title, author, genre, year], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Book added', bookId: result.insertId });
  });
};

exports.deleteBook = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM books WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Book deleted' });
  });
};
