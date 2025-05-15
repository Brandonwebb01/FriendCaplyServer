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

// Update the existing team-picks endpoint
// Update the existing team-picks endpoint
app.get('/api/team-picks/:teamId', (req, res) => {
  const teamId = req.params.teamId;
  const query = `
    SELECT 
      first_round_owner,
      second_round_owner,
      third_round_owner,
      fourth_round_owner,
      fifth_round_owner,
      sixth_round_owner,
      seventh_round_owner
    FROM picks 
    WHERE teamID = ?
  `;
  
  db.query(query, [teamId], (error, results) => {
    if (error) {
      console.error('Error fetching team picks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (results.length === 0) {
        res.json([null, null, null, null, null, null, null]);
        return;
      }
      
      const picks = [
        results[0].first_round_owner,
        results[0].second_round_owner,
        results[0].third_round_owner,
        results[0].fourth_round_owner,
        results[0].fifth_round_owner,
        results[0].sixth_round_owner,
        results[0].seventh_round_owner
      ];
      res.json(picks);
    }
  });
});

// Add endpoint for trading picks
app.post('/api/trade-pick', (req, res) => {
  const { fromTeam, toTeam, round, originalOwner } = req.body;
  
  let roundColumn;
  switch(round) {
    case 1: roundColumn = 'first_round_owner'; break;
    case 2: roundColumn = 'second_round_owner'; break;
    case 3: roundColumn = 'third_round_owner'; break;
    case 4: roundColumn = 'fourth_round_owner'; break;
    case 5: roundColumn = 'fifth_round_owner'; break;
    case 6: roundColumn = 'sixth_round_owner'; break;
    case 7: roundColumn = 'seventh_round_owner'; break;
    default: return res.status(400).json({ error: 'Invalid round' });
  }
  
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: 'Transaction error' });
    }
    
    // Remove pick from current owner
    const removePickQuery = `UPDATE picks SET ${roundColumn} = NULL WHERE teamID = ? AND ${roundColumn} = ?`;
    db.query(removePickQuery, [fromTeam, originalOwner], (error1, results1) => {
      if (error1) {
        return db.rollback(() => {
          res.status(500).json({ error: 'Failed to remove pick' });
        });
      }
      
      // Add pick to new owner
      const addPickQuery = `UPDATE picks SET ${roundColumn} = ? WHERE teamID = ?`;
      db.query(addPickQuery, [originalOwner, toTeam], (error2, results2) => {
        if (error2) {
          return db.rollback(() => {
            res.status(500).json({ error: 'Failed to add pick' });
          });
        }
        
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: 'Failed to commit transaction' });
            });
          }
          res.json({ success: true, message: 'Pick traded successfully' });
        });
      });
    });
  });
});

// Get available picks for trading
app.get('/api/available-picks/:teamId', (req, res) => {
  const teamId = req.params.teamId;
  const query = `
    SELECT 
      first_round_owner,
      second_round_owner,
      third_round_owner,
      fourth_round_owner,
      fifth_round_owner,
      sixth_round_owner,
      seventh_round_owner
    FROM picks 
    WHERE teamID = ?
  `;
  
  db.query(query, [teamId], (error, results) => {
    if (error) {
      console.error('Error fetching available picks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const availablePicks = [];
      if (results.length > 0) {
        const picks = results[0];
        ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'].forEach((round, index) => {
          const owner = picks[`${round}_round_owner`];
          if (owner) {
            availablePicks.push({
              round: index + 1,
              originalOwner: owner,
              roundName: round
            });
          }
        });
      }
      res.json(availablePicks);
    }
  });
});

// Get available picks for trading
app.get('/api/available-picks/:teamId', (req, res) => {
  const teamId = req.params.teamId;
  const query = `
    SELECT 
      first_round_owner,
      second_round_owner,
      third_round_owner,
      fourth_round_owner,
      fifth_round_owner,
      sixth_round_owner,
      seventh_round_owner
    FROM picks 
    WHERE teamID = ?
  `;
  
  db.query(query, [teamId], (error, results) => {
    if (error) {
      console.error('Error fetching available picks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const availablePicks = [];
      if (results.length > 0) {
        const picks = results[0];
        ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'].forEach((round, index) => {
          const owner = picks[`${round}_round_owner`];
          if (owner) {
            availablePicks.push({
              round: index + 1,
              originalOwner: owner,
              roundName: round
            });
          }
        });
      }
      res.json(availablePicks);
    }
  });
});


// Endpoint to get team logo
app.get('/api/team-logo/:teamId', (req, res) => {
  const teamId = req.params.teamId;
  const query = 'SELECT logo FROM nhl_teams WHERE team_id = ?';
  
  db.query(query, [teamId], (error, results) => {
    if (error) {
      console.error('Error fetching team logo:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    
    if (results.length === 0 || !results[0].logo) {
      res.status(404).json({ error: 'Logo not found' });
      return;
    }
    
    // Convert blob to base64
    const logo = results[0].logo;
    const base64Logo = `data:image/png;base64,${logo.toString('base64')}`;
    res.json({ logo: base64Logo });
  });
});

// Update your existing teams endpoint to include logo data
app.get('/api/teams', (req, res) => {
  const query = 'SELECT team_id, team_name, division, logo FROM nhl_teams ORDER BY division, team_name';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching teams:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    
    // Convert logo blobs to base64 for each team
    const teamsWithLogos = results.map(team => ({
      ...team,
      logo: team.logo ? `data:image/png;base64,${team.logo.toString('base64')}` : null
    }));
    
    res.json(teamsWithLogos);
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