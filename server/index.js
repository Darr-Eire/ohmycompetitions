const express = require('express');
const http = require('http');
const cors = require('cors');
const { setupSocket, createBattle, battles } = require('./socket');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
setupSocket(server);

// Create sample battles
createBattle({ battleId: 'battle1', boxId: 'Box #1', entryFee: 10, maxPlayers: 2 });
createBattle({ battleId: 'battle2', boxId: 'Box #2', entryFee: 20, maxPlayers: 2 });
createBattle({ battleId: 'battle3', boxId: 'Box #3', entryFee: 5, maxPlayers: 2 });

app.get('/api/pi-battles/list', (req, res) => {
  res.json(Object.values(battles));
});

app.get('/api/pi-battles/:battleId', (req, res) => {
  const battle = battles[req.params.battleId];
  if (!battle) return res.status(404).json({ error: 'Battle not found' });
  res.json(battle);
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
