const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'recruitment'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Backend is working!');
});

// ✅ Signup
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

// ✅ Login
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

// ✅ TextRazor proxy route
app.post('/analyze-text', async (req, res) => {
  const { text } = req.body;
  const apiKey = process.env.TEXTRAZOR_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'TextRazor API key missing in backend .env' });
  }

  try {
    const response = await fetch('https://api.textrazor.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-textrazor-key': apiKey
      },
      body: new URLSearchParams({
        text,
        extractors: 'entities,topics,words,phrases'
      })
    });

    const data = await response.json();
    console.log('🧠 TextRazor full response:', JSON.stringify(data, null, 2));

    res.json(data);
  } catch (err) {
    console.error('TextRazor backend error:', err);
    res.status(500).json({ error: 'Failed to fetch from TextRazor' });
  }
});

// ✅ Start server
app.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
});
