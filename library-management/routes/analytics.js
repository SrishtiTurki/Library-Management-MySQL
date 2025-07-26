const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // assumes you have this set up

// Example: total books count
router.get('/total-books', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total_books FROM books');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: most borrowed book
router.get('/most-borrowed', async (req, res) => {
  try {
    const [rows] = await db.query(`
        SELECT B.BOOK_NAME AS Title, COUNT(*) AS Times_Borrowed
    FROM BORROWING BR
    JOIN BOOKS B ON BR.BOOK_ID = B.BOOK_ID
    GROUP BY B.BOOK_NAME
    ORDER BY Times_Borrowed DESC
    LIMIT 10;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fine analytics

router.get('/fine-analytics', async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT 
      MONTH(BR.RETURN_DATE) AS Month,
      M.MEMBER_TYPE,
      SUM(F.FINE_IMPOSED) AS Total_Fines
    FROM BORROWING BR
    JOIN FINE F ON BR.BORROW_ID = F.BORROW_ID
    JOIN MEMBERS M ON BR.MEMBER_ID = M.MEMBER_ID
    WHERE BR.RETURN_DATE IS NOT NULL
    GROUP BY MONTH(BR.RETURN_DATE), M.MEMBER_TYPE
    ORDER BY Month, M.MEMBER_TYPE;


    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// member type and borrowings

router.get('/membertype-borrowings', async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT M.MEMBER_TYPE, COUNT(BR.BORROW_ID) AS Total_Borrowed
    FROM MEMBERS M
    JOIN BORROWING BR ON M.MEMBER_ID = BR.MEMBER_ID
    GROUP BY M.MEMBER_TYPE;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// member borrowings but percentage


router.get('/membertype-b-percentage', async (req, res) => {
  try {
    const [rows] = await db.query(`
        SELECT 
    M.MEMBER_TYPE,
    COUNT(*) AS Borrow_Count,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM BORROWING)), 2) AS Percentage
    FROM BORROWING BR
    JOIN MEMBERS M ON BR.MEMBER_ID = M.MEMBER_ID
    GROUP BY M.MEMBER_TYPE;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// members but percentage

router.get('/total-members', async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT 
        MEMBER_TYPE,
        COUNT(*) AS member_count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM MEMBERS), 2) AS percentage
        FROM MEMBERS
        GROUP BY MEMBER_TYPE;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// borrowing according to months

router.get('/most-borrowed-month', async (req, res) => {
  try {
    const [rows] = await db.query(`
                SELECT 
        MONTHNAME(BORROW_DATE) AS borrow_month,
        COUNT(*) AS total_borrowings
        FROM BORROWING
        GROUP BY MONTH(BORROW_DATE), MONTHNAME(BORROW_DATE)
        ORDER BY total_borrowings DESC;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// fine imposed on members types


router.get('/fine-imposed', async (req, res) => {
  try {
    const [rows] = await db.query(`
                    SELECT 
        M.MEMBER_TYPE,
        SUM(F.FINE_IMPOSED) AS Total_Fine_Collected
        FROM FINE F
        JOIN BORROWING BR ON F.BORROW_ID = BR.BORROW_ID
        JOIN MEMBERS M ON BR.MEMBER_ID = M.MEMBER_ID
        GROUP BY M.MEMBER_TYPE;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
