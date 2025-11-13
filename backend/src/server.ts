import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupGameSocket } from './socket/gameSocket';

const app = express();
const httpServer = createServer(app);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Socket.io configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup socket handlers
setupGameSocket(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Battle Royale Card Game Server' });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║  Battle Royale Mauricienne - Server Started ║
  ╠══════════════════════════════════════════════╣
  ║  Port: ${PORT}                                ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}              ║
  ╚══════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
