// backend/server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // your MySQL password
  database: 'recruitment'
});

// Signup route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
  db.query(query, [email, hashed], (err, result) => {
    if (err) return res.status(500).send({ success: false, error: err });
    res.send({ success: true, userId: result.insertId });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send({ success: false });
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send({ success: false });
    res.send({ success: true, userId: user.id });
  });
});

// Save report with user ID
app.post('/save-report', (req, res) => {
  const { matched, missing, suggestions, userId } = req.body;
  const query = 'INSERT INTO reports (matched, missing, suggestions, user_id) VALUES (?, ?, ?, ?)';
  db.query(query, [JSON.stringify(matched), JSON.stringify(missing), JSON.stringify(suggestions), userId], (err, result) => {
    if (err) return res.status(500).send({ success: false, error: err });
    res.send({ success: true, id: result.insertId });
  });
});

// Get reports for a user
app.get('/get-reports/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC';
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).send({ success: false, error: err });
    res.send({ success: true, reports: results });
  });
});

// Delete a report
app.delete('/delete-report/:id', (req, res) => {
  const reportId = req.params.id;
  const query = 'DELETE FROM reports WHERE id = ?';
  db.query(query, [reportId], (err, result) => {
    if (err) return res.status(500).send({ success: false, error: err });
    res.send({ success: true });
  });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
