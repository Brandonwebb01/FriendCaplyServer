// Function to determine contract years
const determineContractYears = (age, contractType, contractWay) => {
    if (contractType === 'Entry' || contractWay === 'two-way') {
      if (age === 18) return 3;
      if (age >= 19 && age <= 21) return Math.floor(Math.random() * 2) + 2; // 2 or 3 years
      return Math.floor(Math.random() * 3) + 1; // 1 to 3 years
    }
    // Standard contracts
    return Math.floor(Math.random() * 8) + 1; // 1 to 8 years
  };
  
  // Function to update players with contract years
  const updatePlayersWithContractYears = () => {
    const query = 'SELECT id, age, contract_type, contract_way FROM players';
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching players:', err);
        connection.end();
        return;
      }
  
      const updatePromises = results.map(player => {
        const years = determineContractYears(player.age, player.contract_type, player.contract_way);
        return new Promise((resolve, reject) => {
          connection.query(
            'UPDATE players SET years = ? WHERE id = ?',
            [years, player.id],
            (updateErr) => {
              if (updateErr) reject(updateErr);
              else resolve();
            }
          );
        });
      });
  
      Promise.all(updatePromises)
        .then(() => {
          console.log(`${results.length} players updated with contract years.`);
          connection.end();
        })
        .catch(updateErr => {
          console.error('Error updating players with contract years:', updateErr);
          connection.end();
        });
    });
  };
  
  module.exports = { insertPlayersWithContractWay, updatePlayersWithContractYears };
  
  // For testing, you can call the functions directly
  // insertPlayersWithContractWay();
  //updatePlayersWithContractYears();