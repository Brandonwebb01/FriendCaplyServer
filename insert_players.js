const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'friendcaply'
});

// List of players
const players = [
  ['Bob Joe', 31, "6'7\"", 'Left', 'LHD', 2000000, 'Standard', 10, 1, 9, 52, 1],
  ['Dan "The" Man', 35, "6'0\"", 'Right', 'C', 1000000, 'Standard', 18, 3, 15, 23, 1],
  ['Henry Ford', 22, "5'11\"", 'Left', 'LW', 5200000, 'Standard', 55, 25, 30, 33, 1],
  ['Dylan Lanny', 26, "6'2\"", 'Right', 'RW', 1200000, 'Standard', 8, 4, 4, 49, 1],
  ['Moseby Rogers', 19, "5'10\"", 'Left', 'LW', 1500000, 'Standard', 14, 4, 10, 22, 1],
  // Add more players as necessary
];

// Function to insert players into the database
const insertPlayers = () => {
  const query = 'INSERT INTO players (name, age, height, handed, position, salary, contract_type, points, goals, assists, pim, teamid) VALUES ?';

  connection.query(query, [players], (err, result) => {
    if (err) {
      console.error('Error inserting players:', err);
      connection.end();
      return;
    }
    console.log(`${result.affectedRows} players inserted.`);
    connection.end();
  });
};

module.exports = insertPlayers;

// For testing, you can call insertPlayers function directly
//insertPlayers();