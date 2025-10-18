import { Server as NetServer } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { redis } from '../../lib/redis';
import { nanoid } from 'nanoid';
// We need to be able to call the Gemini service from the server
import { fetchQuizQuestions } from '../../services/quizService'; 

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetServer & {
    server: SocketIOServer;
  };
};

const MATCHMAKING_QUEUE_KEY = 'quiz:battle:queue';
const BATTLE_ROOM_PREFIX = 'quiz:battle:room:';

// Helper function to create and store a new battle
const createBattle = async (io: SocketIOServer, playerOneId: string, playerTwoId?: string) => {
  const battleRoomId = nanoid(10);
  console.log(`Creating battle: ${battleRoomId}`);
  
  try {
    // 1. Server fetches the quiz questions
    const questions = await fetchQuizQuestions('Data Structures and Algorithms', 'medium', 5);
    
    // 2. Store questions in Redis for players to fetch
    await redis.set(`${BATTLE_ROOM_PREFIX}${battleRoomId}`, JSON.stringify(questions), { ex: 3600 }); // Expires in 1 hour

    // 3. Tell players the battle is ready
    if (playerTwoId) {
      // For random match
      io.to(playerOneId).emit('match_found', battleRoomId);
      io.to(playerTwoId).emit('match_found', battleRoomId);
    } else {
      // For private lobby (playerOneId is the lobby ID)
      io.to(playerOneId).emit('battle_starting', battleRoomId);
    }
  } catch (error) {
    console.error('Failed to create battle:', error);
    // Tell players something went wrong
    io.to(playerOneId).emit('battle_error', 'Failed to generate quiz questions.');
    if (playerTwoId) io.to(playerTwoId).emit('battle_error', 'Failed to generate quiz questions.');
  }
};


const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!(res.socket as any).server.io) {
    console.log('🔌 Initializing Socket.IO server...');
    const io = new SocketIOServer(res.socket.server as any, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    (res.socket as any).server.io = io;

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // --- 1. RANDOM MATCHMAKING ---
      socket.on('join_random_queue', async (userId: string) => {
        const opponentId = (await redis.spop(MATCHMAKING_QUEUE_KEY)) as string | null;

        if (opponentId && opponentId !== userId) {
          console.log(`🎯 Match found: ${userId} vs ${opponentId}`);
          // Create the battle (server fetches questions)
          await createBattle(io, socket.id, opponentId);
        } else {
          console.log(`🕒 User ${userId} (socket ${socket.id}) added to queue`);
          await redis.sadd(MATCHMAKING_QUEUE_KEY, socket.id);
          
          socket.on('disconnect', () => {
            redis.srem(MATCHMAKING_QUEUE_KEY, socket.id);
            console.log(`🚪 User ${userId} removed from queue`);
          });
        }
      });

      // --- 2. PRIVATE ROOM ---
      socket.on('join_private_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`👥 User ${socket.id} joined private room: ${roomId}`);
        socket.to(roomId).emit('player_joined', socket.id);
      });

      // --- 3. START PRIVATE BATTLE ---
      socket.on('start_private_battle', (lobbyRoomId: string) => {
        // Create the battle (server fetches questions)
        // The "lobbyRoomId" becomes the playerOneId to notify
        createBattle(io, lobbyRoomId);
      });

      // --- 4. BATTLE ROOM LOGIC ---
      socket.on('join_battle_room', (battleRoomId: string) => {
        socket.join(battleRoomId);
        console.log(`⚔️ User ${socket.id} joined battle: ${battleRoomId}`);
        // Announce to the other player that you are ready
        socket.to(battleRoomId).emit('opponent_ready');
      });

      // A player submitted an answer
      socket.on('submit_answer', (battleRoomId: string, isCorrect: boolean) => {
        // Tell the opponent if they were right or wrong
        socket.to(battleRoomId).emit('opponent_answered', isCorrect);
      });

      // A player is moving to the next question
      socket.on('next_question', (battleRoomId: string, newIndex: number) => {
        socket.to(battleRoomId).emit('opponent_moved_to_next', newIndex);
      });
      
      // --- 5. CLEANUP ---
      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        redis.srem(MATCHMAKING_QUEUE_KEY, socket.id);
      });
    });
  }
  res.end();
};

export default SocketHandler;