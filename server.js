const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'friendcaply'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Update the login endpoint to include admin status
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT userID, username, email, admin FROM users WHERE username = ? AND password = ?';
  
  db.query(query, [username, password], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.get('/api/team-picks/:teamId', (req, res) => {
  const teamId = req.params.teamId;
  const query = 'SELECT first, second, third, forth, fifth, sixth, seventh FROM picks WHERE teamID = ?';
  
  db.query(query, [teamId], (error, results) => {
    if (error) {
      console.error('Error fetching team picks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // Convert the result to an array format
      const picks = results[0] ? [
        results[0].first,
        results[0].second,
        results[0].third,
        results[0].forth,
        results[0].fifth,
        results[0].sixth,
        results[0].seventh
      ] : [];
      res.json(picks);
    }
  });
});

// Add new endpoint for adding players
app.post('/api/add-player', (req, res) => {
  const {
    name, age, height, handed, position, salary,
    contract_type, contract_way, years, points,
    goals, assists, pim, teamid
  } = req.body;

  const query = `
    INSERT INTO players (
      name, age, height, handed, position, salary,
      contract_type, contract_way, years, points,
      goals, assists, pim, teamid
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name, age, height, handed, position, salary,
    contract_type, contract_way, years, points,
    goals, assists, pim, teamid
  ];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error adding player:', error);
      res.status(500).json({ error: 'Failed to add player' });
    } else {
      res.json({ success: true, playerId: results.insertId });
    }
  });
});

app.get('/api/teams', (req, res) => {
  const query = 'SELECT team_id, team_name, division FROM nhl_teams ORDER BY division, team_name';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching teams:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

app.get('/api/team-roster/:teamId', (req, res) => {
  const teamId = req.params.teamId;
  const query = 'SELECT * FROM players WHERE teamid = ?';
  db.query(query, [teamId], (error, results) => {
    if (error) {
      console.error('Error fetching team roster:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } else {
      res.json(results || []);
    }
  });
});

app.get('/api/free-agents', (req, res) => {
  const query = 'SELECT * FROM players WHERE teamid IS NULL';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching free agents:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } else {
      res.json(results || []);
    }
  });
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, password, email } = req.body;
  const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  
  db.query(query, [username, password, email], (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'Username already exists' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.json({ success: true, userId: results.insertId });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});