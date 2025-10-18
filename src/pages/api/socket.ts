import { Server as NetServer } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { redis } from '../../lib/redis';
import { nanoid } from 'nanoid';

// Extend Next.js API response to include Socket.IO server instance
type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetServer & {
    server: SocketIOServer;
  };
};

// Redis key for the matchmaking queue
const MATCHMAKING_QUEUE_KEY = 'quiz:battle:queue';

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  // Initialize Socket.IO only once
  if (!(res.socket as any).server.io) {
    console.log('🔌 Initializing Socket.IO server...');
    const io = new SocketIOServer(res.socket.server as any, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    // Store the instance to prevent reinitialization
    (res.socket as any).server.io = io;

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // --- 1. RANDOM MATCHMAKING LOGIC ---
      socket.on('join_random_queue', async (userId: string) => {
        // Try to find an opponent
        const opponentId = (await redis.spop(MATCHMAKING_QUEUE_KEY)) as string | null;

        if (opponentId && opponentId !== userId) {
          // --- MATCH FOUND ---
          console.log(`🎯 Match found: ${userId} vs ${opponentId}`);
          const roomId = nanoid(10);

          // Notify both users to join the same room
          io.to(opponentId).emit('match_found', roomId);
          socket.emit('match_found', roomId);
        } else {
          // --- NO MATCH FOUND ---
          console.log(`🕒 User ${userId} added to queue`);
          await redis.sadd(MATCHMAKING_QUEUE_KEY, userId);

          // Remove on disconnect
          socket.on('disconnect', () => {
            redis.srem(MATCHMAKING_QUEUE_KEY, userId);
            console.log(`🚪 User ${userId} removed from queue due to disconnect`);
          });
        }
      });

      // --- 2. PRIVATE ROOM LOGIC ---
      socket.on('join_private_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`👥 User ${socket.id} joined private room: ${roomId}`);
        socket.to(roomId).emit('player_joined', socket.id);
      });

      // --- 3. BATTLE LOGIC ---
      socket.on('submit_answer', (roomId: string, answer: string) => {
        socket.to(roomId).emit('opponent_answered', answer);
      });

      // --- 4. CLEANUP ---
      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        redis.srem(MATCHMAKING_QUEUE_KEY, socket.id);
      });
    });
  }

  res.end();
};

export default SocketHandler;
