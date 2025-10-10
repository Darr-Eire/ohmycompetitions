const { Server } = require("socket.io");

const battles = {};

function createBattle({ battleId, boxId, entryFee, maxPlayers }) {
  battles[battleId] = {
    _id: battleId,
    boxId,
    entryFee,
    maxPlayers,
    players: [],
    hp: {},
    turn: null,
    winner: null,
  };
}

function setupSocket(server) {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinBattle", ({ battleId, userId, username }) => {
      if (!battles[battleId]) return;
      const battle = battles[battleId];
      const alreadyJoined = battle.players.some(p => p.userId === userId);

      if (!alreadyJoined && battle.players.length < battle.maxPlayers) {
        battle.players.push({ userId, username, ready: false });
      }

      socket.join(battleId);
      io.to(battleId).emit("battleUpdate", battle);
    });

    socket.on("setReady", ({ battleId, userId }) => {
      const battle = battles[battleId];
      if (!battle) return;

      const player = battle.players.find(p => p.userId === userId);
      if (player) player.ready = true;

      const allReady = battle.players.length === battle.maxPlayers &&
                       battle.players.every(p => p.ready);

      io.to(battleId).emit("battleUpdate", battle);
      io.to(battleId).emit("readyUpdate", { battleId, readyState: { allReady, waiting: !allReady } });

      if (allReady) {
        const initialHp = {};
        battle.players.forEach(p => initialHp[p.userId] = 100);
        const firstTurn = battle.players[0].userId;

        battle.hp = initialHp;
        battle.turn = firstTurn;
        battle.winner = null;

        io.to(battleId).emit("battleUpdate", battle);
      }
    });

    socket.on("attack", ({ battleId, damage, attacker }) => {
      const battle = battles[battleId];
      if (!battle) return;

      const opponent = battle.players.find(p => p.userId !== attacker);
      if (!opponent) return;

      battle.hp[opponent.userId] -= damage;
      if (battle.hp[opponent.userId] <= 0) {
        battle.hp[opponent.userId] = 0;
        battle.winner = battle.players.find(p => p.userId === attacker).username;
      }

      battle.turn = opponent.userId;

      io.to(battleId).emit("battleUpdate", battle);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { setupSocket, battles, createBattle };
