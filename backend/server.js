const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Optional: use .env for credentials

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'recruitment'
});
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Backend is working!');
});

// ✅ Signup route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(query, [email, hashed], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, userId: result.insertId });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'User not found' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Incorrect password' });

    res.json({ success: true, userId: user.id });
  });
});

// ✅ Save report
app.post('/save-report', (req, res) => {
  const { matched, missing, suggestions, userId } = req.body;
  const query = 'INSERT INTO reports (matched, missing, suggestions, user_id) VALUES (?, ?, ?, ?)';
  db.query(
    query,
    [JSON.stringify(matched), JSON.stringify(missing), JSON.stringify(suggestions), userId],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// ✅ Get reports
app.get('/get-reports/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC';
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, reports: results });
  });
});

// ✅ Delete report
app.delete('/delete-report/:id', (req, res) => {
  const reportId = req.params.id;
  const query = 'DELETE FROM reports WHERE id = ?';
  db.query(query, [reportId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

// ✅ Start server
app.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
});

