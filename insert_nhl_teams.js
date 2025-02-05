const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'friendcaply'
});

// List of NHL teams
const nhlTeams = [
  [1, 'Boston Bruins', 'Boston'],
  [2, 'Buffalo Sabres', 'Buffalo'],
  [3, 'Detroit Red Wings', 'Detroit'],
  [4, 'Florida Panthers', 'Sunrise'],
  [5, 'Montreal Canadiens', 'Montreal'],
  [6, 'Ottawa Senators', 'Ottawa'],
  [7, 'Tampa Bay Lightning', 'Tampa'],
  [8, 'Toronto Maple Leafs', 'Toronto'],
  [9, 'Carolina Hurricanes', 'Raleigh'],
  [10, 'Columbus Blue Jackets', 'Columbus'],
  [11, 'New Jersey Devils', 'Newark'],
  [12, 'New York Islanders', 'New York'],
  [13, 'New York Rangers', 'New York'],
  [14, 'Philadelphia Flyers', 'Philadelphia'],
  [15, 'Pittsburgh Penguins', 'Pittsburgh'],
  [16, 'Washington Capitals', 'Washington'],
  [17, 'Chicago Blackhawks', 'Chicago'],
  [18, 'Colorado Avalanche', 'Denver'],
  [19, 'Dallas Stars', 'Dallas'],
  [20, 'Minnesota Wild', 'St. Paul'],
  [21, 'Nashville Predators', 'Nashville'],
  [22, 'St. Louis Blues', 'St. Louis'],
  [23, 'Winnipeg Jets', 'Winnipeg'],
  [24, 'Anaheim Ducks', 'Anaheim'],
  [25, 'Utah Hockey Club', 'Salt Lake City'],
  [26, 'Calgary Flames', 'Calgary'],
  [27, 'Edmonton Oilers', 'Edmonton'],
  [28, 'Los Angeles Kings', 'Los Angeles'],
  [29, 'San Jose Sharks', 'San Jose'],
  [30, 'Seattle Kraken', 'Seattle'],
  [31, 'Vancouver Canucks', 'Vancouver'],
  [32, 'Vegas Golden Knights', 'Las Vegas']
];

// Function to insert NHL teams into the database
const insertNHLTeams = () => {
  // Check if teams are already inserted
  connection.query('SELECT COUNT(*) AS count FROM nhl_teams', (err, results) => {
    if (err) throw err;

    if (results[0].count === 0) {
      const query = 'INSERT INTO nhl_teams (team_id, team_name, city) VALUES ?';

      connection.query(query, [nhlTeams], (err, result) => {
        if (err) throw err;
        console.log(`${result.affectedRows} teams inserted.`);
        connection.end();
      });
    } else {
      console.log('Teams already inserted.');
      connection.end();
    }
  });
};

module.exports = insertNHLTeams;

//insertNHLTeams();