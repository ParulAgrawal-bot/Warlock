import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';

const port = Number(process.env.PORT || process.env.DUAL_PORT || 3001);
const rooms = new Map();
const validLanguages = new Set(['javascript', 'python', 'java', 'cpp', 'csharp']);
const challengeIds = [1, 2, 3];

function send(socket, message) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function publicRoom(room) {
  return {
    roomCode: room.code,
    players: [...room.players.values()].map(({ id, name, socket, code, language }) => ({
      id, name, connected: socket?.readyState === WebSocket.OPEN, code, language,
    })),
    questionId: room.questionId,
    startedAt: room.startedAt,
    roundId: room.roundId,
    submissions: Object.fromEntries(room.submissions),
    winnerId: room.winnerId,
  };
}

function broadcast(room, message) {
  for (const player of room.players.values()) send(player.socket, message);
}

function syncRoom(room) {
  broadcast(room, { type: 'room:state', room: publicRoom(room) });
}

function cleanRoom(room) {
  if ([...room.players.values()].every((player) => !player.socket || player.socket.readyState !== WebSocket.OPEN)) {
    room.emptyTimer = setTimeout(() => rooms.delete(room.code), 5 * 60 * 1000);
    room.emptyTimer.unref?.();
  } else if (room.emptyTimer) {
    clearTimeout(room.emptyTimer);
    room.emptyTimer = null;
  }
}

function roomFor(code) {
  let room = rooms.get(code);
  if (!room) {
    room = { code, players: new Map(), questionId: null, startedAt: null, roundId: null, submissions: new Map(), winnerId: null, emptyTimer: null };
    rooms.set(code, room);
  }
  return room;
}

const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  response.writeHead(404);
  response.end('Not found');
});

const wss = new WebSocketServer({ server, path: '/dual-ws', maxPayload: 128 * 1024 });

wss.on('connection', (socket) => {
  let activeRoom = null;
  let player = null;

  socket.on('message', (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { send(socket, { type: 'error', message: 'Invalid message.' }); return; }

    if (message.type === 'join') {
      const code = String(message.roomCode || '').trim().toUpperCase();
      const id = String(message.playerId || '').slice(0, 64) || randomUUID();
      const name = String(message.name || 'Player').trim().slice(0, 24) || 'Player';
      if (!/^[A-Z0-9]{4,8}$/.test(code)) { send(socket, { type: 'error', message: 'Room codes must be 4 to 8 letters or numbers.' }); return; }
      const room = roomFor(code);
      let existing = room.players.get(id);
      if (!existing && room.players.size >= 2) { send(socket, { type: 'error', message: 'This room already has two players.' }); return; }
      if (activeRoom && activeRoom !== room && player) activeRoom.players.delete(player.id);
      if (existing?.socket && existing.socket !== socket) existing.socket.close(4001, 'Reconnected elsewhere');
      if (existing) {
        existing.socket = socket;
        existing.name = name;
      } else {
        existing = { id, name, socket, code: '', language: 'javascript' };
        room.players.set(id, existing);
      }
      activeRoom = room;
      player = existing;
      send(socket, { type: 'joined', playerId: id });
      syncRoom(room);
      cleanRoom(room);
      return;
    }

    if (!activeRoom || !player) { send(socket, { type: 'error', message: 'Join a room first.' }); return; }

    if (message.type === 'code:update') {
      if (typeof message.code !== 'string' || message.code.length > 100_000) return;
      const language = validLanguages.has(message.language) ? message.language : 'javascript';
      player.code = message.code;
      player.language = language;
      for (const other of activeRoom.players.values()) {
        if (other.id !== player.id) send(other.socket, { type: 'opponent:code', playerId: player.id, code: player.code, language: player.language });
      }
      return;
    }

    if (message.type === 'round:start') {
      if ([...activeRoom.players.values()].filter((entry) => entry.socket?.readyState === WebSocket.OPEN).length !== 2) {
        send(socket, { type: 'error', message: 'Both players must be connected before starting a round.' });
        return;
      }
      activeRoom.questionId = challengeIds[Math.floor(Math.random() * challengeIds.length)];
      activeRoom.startedAt = Date.now();
      activeRoom.roundId = randomUUID();
      activeRoom.submissions = new Map();
      activeRoom.winnerId = null;
      for (const entry of activeRoom.players.values()) entry.code = '';
      syncRoom(activeRoom);
      return;
    }

    if (message.type === 'round:submit') {
      if (!activeRoom.roundId || activeRoom.winnerId || message.roundId !== activeRoom.roundId) return;
      const passed = Math.max(0, Math.min(100, Number(message.passed) || 0));
      const total = Math.max(0, Math.min(100, Number(message.total) || 0));
      const score = Math.max(0, Math.min(100, Number(message.score) || 0));
      activeRoom.submissions.set(player.id, {
        passed, total, score,
        language: validLanguages.has(message.language) ? message.language : player.language,
        error: typeof message.error === 'string' ? message.error.slice(0, 300) : null,
      });
      if (activeRoom.submissions.size === 2) {
        const [first, second] = [...activeRoom.submissions.entries()];
        activeRoom.winnerId = first[1].score === second[1].score ? 'draw' : first[1].score > second[1].score ? first[0] : second[0];
      }
      syncRoom(activeRoom);
    }

    if (message.type === 'round:expire' && message.roundId === activeRoom.roundId && !activeRoom.winnerId) {
      activeRoom.winnerId = 'expired';
      syncRoom(activeRoom);
    }
  });

  socket.on('close', () => {
    if (activeRoom && player) {
      const current = activeRoom.players.get(player.id);
      if (current?.socket === socket) current.socket = null;
      syncRoom(activeRoom);
      cleanRoom(activeRoom);
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Dual player WebSocket server listening on port ${port}`);
});
