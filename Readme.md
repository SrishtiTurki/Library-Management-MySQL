# 📚 Library Management System (Node.js + MySQL)

A modular and scalable Library Management System built with **Node.js**, **Express**, and **MySQL**. This project manages key operations of a library such as managing books, staff, members, borrowings, returns, and fines.

---

## 🚀 Features

- 📖 Book Management (Add, View, Delete)
- 👥 Member & Staff Management
- 📆 Borrowing and Return Tracking
- 💸 Fine Calculation
- 🔐 Secure Routing (modular controllers & routers)
- 🛠️ Clean, Modular Architecture

---
### 1. Clone the repository
git clone https://github.com/SrishtiTurki/Library-Management-MySQL.git //
cd library-management

### 2. Make sure to download dependencies

### 3. Update your database credentials in config/db.js:

const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'library_db'
});

### 4. Run the server
node server.js

### 🛠️ Tech Stack
Backend: Node.js, Express
Database: MySQL
Others: Nodemon (for dev), dotenv, MySQL2


