require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const initializeSockets = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://codeaarenaverse.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST']
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Import code execution route
const codeExecutionRoute = require('./services/codeExecution');
app.use('/api/execute', codeExecutionRoute);

app.get('/', (req, res) => {
  res.send('Code Editor Backend is running.');
});

// Initialize socket handlers
initializeSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
