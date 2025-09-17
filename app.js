// server-sample.js
// Minimal signaling server (Node.js) using "ws".
// Usage: node server-sample.js
// NOTE: host this on a real server (Render / Railway / Glitch) with an accessible wss URL.
// The client must set SIGNALING_SERVER_URL to this server's wss://... address.

const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });
console.log('Signaling WS running on port', port);

// rooms: roomId -> Set of sockets
const rooms = new Map();

wss.on('connection', (ws) => {
  ws.room = null;
  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg.toString()); } catch(e){ return; }
    const { room, type } = data;
    if(!room) return;
    // ensure room exists
    if(!rooms.has(room)) rooms.set(room, new Set());
    if(type === 'offer' || type === 'answer' || type === 'candidate'){
      // broadcast to others in room
      rooms.get(room).forEach(client => {
        if(client !== ws && client.readyState === WebSocket.OPEN){
          client.send(JSON.stringify(data));
        }
      });
    } else {
      // join room
      if(!rooms.get(room).has(ws)){
        rooms.get(room).add(ws);
        ws.room = room;
      }
      // also broadcast join notice if desired
    }
  });

  ws.on('close', ()=>{
    if(ws.room && rooms.has(ws.room)){
      rooms.get(ws.room).delete(ws);
      if(rooms.get(ws.room).size === 0) rooms.delete(ws.room);
    }
  });
});

process.on('SIGINT', ()=>{ console.log('Shutting down'); process.exit(); });
