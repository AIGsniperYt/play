const WebSocket = require('ws');

const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port });

let players = {};

wss.on('connection', ws => {
  const id = Date.now() + Math.random(); // simple unique ID
  players[id] = { x: Math.random()*500, y: Math.random()*500 };

  // send initial state
  ws.send(JSON.stringify({ type:'init', id, players }));

  ws.on('message', msg => {
    const data = JSON.parse(msg);
    if (data.type === 'move') players[id] = { x: data.x, y: data.y };

    // broadcast updated positions
    const state = JSON.stringify({ type:'update', players });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(state);
    });
  });

  ws.on('close', () => {
    delete players[id];
    const state = JSON.stringify({ type:'update', players });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(state);
    });
  });
});

console.log(`WSS server running on port ${port}`);
