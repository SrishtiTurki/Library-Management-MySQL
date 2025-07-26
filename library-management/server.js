const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const bookRoutes = require('./routes/books');
const staffRoutes = require('./routes/staff');
const membersRoutes = require('./routes/members');
const borrowingRoutes = require('./routes/borrowing');
const fineRoutes = require('./routes/fine');
const analyticsRoutes = require('./routes/analytics');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/books', bookRoutes);
app.use('/staff', staffRoutes);
app.use('/members', membersRoutes);
app.use('/borrowing', borrowingRoutes);
app.use('/fine', fineRoutes);
app.use('/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('Library Management Backend Running');
});

// members
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});


app.post('/members', (req, res) => {
  const { MEMBER_NAME, MEMBER_EMAIL, MEMBER_TYPE, START_DATE, END_DATE } = req.body;

  const endDate = END_DATE === '' ? null : END_DATE;

  const query = `
    INSERT INTO members (MEMBER_NAME, MEMBER_EMAIL, MEMBER_TYPE, START_DATE, END_DATE)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [MEMBER_NAME, MEMBER_EMAIL, MEMBER_TYPE, START_DATE, endDate], (err, result) => {
    if (err) {
      console.error("Database Error:", err); // 👈 Show this
      return res.status(500).json({ error: "Failed to insert member." });
    }
    res.status(201).json({ message: "Member inserted successfully!" });
  });
});


