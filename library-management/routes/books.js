const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // Using the same pool connection

// Get all books with optional filtering
router.get('/', async (req, res) => {
  try {
    console.log('Attempting to connect to database for books...');
    
    // Test connection
    const connection = await db.getConnection();
    console.log('Database connection successful for books');
    connection.release();
    
    // Build query based on optional filters
    let query = 'SELECT * FROM BOOKS';
    const params = [];
    
    if (req.query.genre) {
      query += ' WHERE GENRE = ?';
      params.push(req.query.genre);
    }
    
    if (req.query.author) {
      query += (params.length ? ' AND' : ' WHERE') + ' AUTHOR LIKE ?';
      params.push(`%${req.query.author}%`);
    }
    
    console.log('Executing book query:', query, 'with params:', params);
    const [books] = await db.query(query, params);
    console.log('Books query successful, found:', books.length);
    
    res.json({
      success: true,
      count: books.length,
      books: books.map(book => ({
        ...book,
        // Convert to boolean for availability
        isAvailable: book.AVAILABLE_COPIES > 0
      }))
    });
    
  } catch (err) {
    console.error('Books query error details:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Stack:', err.stack);
    
    res.status(500).json({
      error: 'Failed to fetch books',
      details: err.message,
      code: err.code
    });
  }
});

// Add new book
router.post('/', async (req, res) => {
  try {
    const { 
      BOOK_ID, 
      BOOK_NAME, 
      TOTAL_COPIES, 
      AUTHOR, 
      GENRE,
      AVAILABLE_COPIES = TOTAL_COPIES // Default to total copies if not provided
    } = req.body;
    
    console.log('Inserting book:', { 
      BOOK_ID, 
      BOOK_NAME, 
      TOTAL_COPIES, 
      AUTHOR, 
      GENRE,
      AVAILABLE_COPIES
    });
    
    // Enhanced validation
    if (!BOOK_ID || !BOOK_NAME || !TOTAL_COPIES || !AUTHOR) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['BOOK_ID', 'BOOK_NAME', 'TOTAL_COPIES', 'AUTHOR']
      });
    }
    
    if (AVAILABLE_COPIES > TOTAL_COPIES) {
      return res.status(400).json({
        error: 'Available copies cannot exceed total copies'
      });
    }
    
    const [result] = await db.query(
      `INSERT INTO BOOKS 
       (BOOK_ID, BOOK_NAME, TOTAL_COPIES, AVAILABLE_COPIES, AUTHOR, GENRE) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [BOOK_ID, BOOK_NAME, TOTAL_COPIES, AVAILABLE_COPIES, AUTHOR, GENRE || null]
    );
    
    res.status(201).json({
      message: 'Book added successfully',
      bookId: BOOK_ID,
      details: {
        title: BOOK_NAME,
        author: AUTHOR,
        copies: {
          total: TOTAL_COPIES,
          available: AVAILABLE_COPIES
        }
      }
    });
    
  } catch (error) {
    console.error('Book insertion error:', error.message);
    
    // Handle duplicate entry specifically
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Book with this ID already exists',
        existingId: req.body.BOOK_ID
      });
    }
    
    res.status(500).json({
      error: 'Failed to add book',
      details: error.message,
      code: error.code
    });
  }
});

// Update book details
router.put('/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const updates = req.body;
    
    console.log(`Updating book ${bookId} with:`, updates);
    
    // Validate updates
    if (updates.AVAILABLE_COPIES && updates.TOTAL_COPIES && 
        updates.AVAILABLE_COPIES > updates.TOTAL_COPIES) {
      return res.status(400).json({
        error: 'Available copies cannot exceed total copies'
      });
    }
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (['BOOK_NAME', 'TOTAL_COPIES', 'AVAILABLE_COPIES', 'AUTHOR', 'GENRE'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields provided for update'
      });
    }
    
    values.push(bookId);
    
    const [result] = await db.query(
      `UPDATE BOOKS SET ${fields.join(', ')} WHERE BOOK_ID = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Book not found',
        bookId
      });
    }
    
    res.json({
      message: 'Book updated successfully',
      bookId,
      changes: result.changedRows
    });
    
  } catch (error) {
    console.error('Book update error:', error.message);
    res.status(500).json({
      error: 'Failed to update book',
      details: error.message
    });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log(`Attempting to delete book ${bookId}`);
    
    // First check if book exists
    const [check] = await db.query(
      'SELECT BOOK_ID FROM BOOKS WHERE BOOK_ID = ?',
      [bookId]
    );
    
    if (check.length === 0) {
      return res.status(404).json({
        error: 'Book not found',
        bookId
      });
    }
    
    // Check if copies are checked out
    const [loans] = await db.query(
      'SELECT COUNT(*) as active_loans FROM BOOK_LOANS WHERE BOOK_ID = ? AND RETURN_DATE IS NULL',
      [bookId]
    );
    
    if (loans[0].active_loans > 0) {
      return res.status(400).json({
        error: 'Cannot delete book with active loans',
        activeLoans: loans[0].active_loans
      });
    }
    
    // Proceed with deletion
    const [result] = await db.query(
      'DELETE FROM BOOKS WHERE BOOK_ID = ?',
      [bookId]
    );
    
    res.json({
      message: 'Book deleted successfully',
      bookId
    });
    
  } catch (error) {
    console.error('Book deletion error:', error.message);
    res.status(500).json({
      error: 'Failed to delete book',
      details: error.message
    });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log(`Fetching details for book ${bookId}`);
    
    const [book] = await db.query(
      'SELECT * FROM BOOKS WHERE BOOK_ID = ?',
      [bookId]
    );
    
    if (book.length === 0) {
      return res.status(404).json({
        error: 'Book not found',
        bookId
      });
    }
    
    // Get loan information
    const [loans] = await db.query(
      `SELECT 
        COUNT(*) as total_loans,
        SUM(CASE WHEN RETURN_DATE IS NULL THEN 1 ELSE 0 END) as active_loans
       FROM BOOK_LOANS 
       WHERE BOOK_ID = ?`,
      [bookId]
    );
    
    res.json({
      success: true,
      book: {
        ...book[0],
        loanStats: loans[0]
      }
    });
    
  } catch (error) {
    console.error('Book fetch error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch book details',
      details: error.message
    });
  }
});

module.exports = router;