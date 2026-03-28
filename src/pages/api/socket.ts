import { Server as SocketIOServer } from 'socket.io';
import { redis } from '../../lib/redis';
import { nanoid } from 'nanoid';
import { getBankedQuestions } from '../../services/quizServer';

const QUEUE_KEY = 'quiz:queue';
const ROOM_PREFIX = 'quiz:room';

const SocketHandler = (req: any, res: any) => {
    try {
        if (res.socket.server.io) {
            return res.end();
        }

        if (!(global as any).io || (global as any).io === "initializing") {
            console.log("Initializing Socket.io server...");
            (global as any).io = "initializing";

            const io = new SocketIOServer(res.socket.server, {
                path: '/api/socket',
                addTrailingSlash: false,
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            });
            res.socket.server.io = io;
            (global as any).io = io;

            // Clear the matchmaking queue on server start
            redis.del(QUEUE_KEY).catch(err => console.error("Failed to clear queue:", err));

            io.on('connection', (socket) => {
                console.log(`[SOCKET] Connected: ${socket.id}`);

                socket.on('join_queue', async (data: any) => {
                    const userId = typeof data === 'string' ? data : data.userId;
                    const topic = data?.topic || 'DSA';
                    const difficulty = data?.difficulty || 'medium';

                    console.log(`[MATCHMAKING] User ${userId} (${socket.id}) joined ${topic}/${difficulty}`);

                    (socket as any).matchmakingData = { topic, difficulty };
                    const SPECIFIC_QUEUE_KEY = `${QUEUE_KEY}:${topic}:${difficulty}`;

                    try {
                        const opponent = await redis.spop<string>(SPECIFIC_QUEUE_KEY);
                        if (opponent && opponent !== socket.id) {
                            const opponentSocket = io.sockets.sockets.get(opponent);
                            if (opponentSocket && opponentSocket.connected) {
                                console.log(`[MATCHMAKING] MATCH! ${socket.id} <-> ${opponent}`);
                                const roomId = nanoid(10);
                                const questions = await getBankedQuestions(topic, difficulty, 5);

                                await redis.set(`${ROOM_PREFIX}:${roomId}`, JSON.stringify(questions), { ex: 3600 });
                                await redis.set(`quiz:lobby:${roomId}`, JSON.stringify({ topic, difficulty, count: 5 }), { ex: 3600 });

                                io.to(socket.id).emit('match_found', roomId);
                                io.to(opponent).emit('match_found', roomId);
                                return;
                            }
                        }
                        await redis.sadd(SPECIFIC_QUEUE_KEY, socket.id);
                    } catch (error) {
                        console.error("[MATCHMAKING] Error:", error);
                    }
                });

                socket.on('join_private_room', async (rawRoomId: any) => {
                    const roomId = String(rawRoomId);
                    socket.join(roomId);

                    const sockets = await io.in(roomId).fetchSockets();
                    const playerIds = sockets.map(s => s.id);
                    console.log(`[LOBBY] ${socket.id} joined ${roomId}. Total players: ${playerIds.length}`);

                    const lobbyConfig = await redis.get(`quiz:lobby:${roomId}`);

                    // Notify everyone in the room
                    io.to(roomId).emit('room_update', {
                        players: playerIds,
                        roomConfig: lobbyConfig ? (typeof lobbyConfig === 'string' ? JSON.parse(lobbyConfig) : lobbyConfig) : null
                    });
                });

                socket.on('start_private_battle', async (rawRoomId: any) => {
                    const roomId = String(rawRoomId);
                    console.log(`[LOBBY] Request to start battle in: ${roomId}`);

                    try {
                        const lobbyData = await redis.get(`quiz:lobby:${roomId}`);
                        console.log(`[LOBBY] Retrieved config for ${roomId}:`, lobbyData);

                        const config = lobbyData ? (typeof lobbyData === 'string' ? JSON.parse(lobbyData) : lobbyData) : { topic: 'DSA', difficulty: 'medium', count: 5 };

                        console.log(`[LOBBY] Generating ${config.count} AI questions for ${roomId}...`);
                        const questions = await getBankedQuestions(config.topic, config.difficulty, config.count);

                        if (!questions || questions.length === 0) {
                            console.error(`[LOBBY] FAILED to generate questions for ${roomId}`);
                            io.to(roomId).emit('error', 'Failed to generate quiz questions');
                            return;
                        }

                        await redis.set(`${ROOM_PREFIX}:${roomId}`, JSON.stringify(questions), { ex: 3600 });
                        console.log(`[LOBBY] Battle questions ready for ${roomId}. Emitting battle_starting.`);

                        io.to(roomId).emit('battle_starting', roomId);
                    } catch (err) {
                        console.error("[LOBBY] Critical failure in start_private_battle:", err);
                        io.to(roomId).emit('error', 'An internal error occurred while starting the battle');
                    }
                });

                socket.on('join_battle', (rawRoomId: any) => {
                    const roomId = String(rawRoomId);
                    socket.join(roomId);
                    console.log(`[BATTLE] ${socket.id} joined ${roomId}`);
                });

                socket.on('submit_answer', (rawRoomId: any, data: any) => {
                    const roomId = String(rawRoomId);
                    socket.to(roomId).emit('opponent_update', data);
                });

                socket.on('disconnect', () => {
                    const { topic, difficulty } = (socket as any).matchmakingData || {};
                    if (topic && difficulty) {
                        redis.srem(`${QUEUE_KEY}:${topic}:${difficulty}`, socket.id);
                    }
                    redis.srem(QUEUE_KEY, socket.id);
                    console.log(`[SOCKET] Disconnected: ${socket.id}`);
                });

                socket.on('request_rematch', async (rawRoomId: any, userId: string) => {
                    const roomId = String(rawRoomId);
                    const rematchKey = `quiz:rematch:${roomId}`;
                    const opponentId = await redis.hget(rematchKey, 'pending_user');

                    if (opponentId && opponentId !== userId) {
                        const newRoomId = nanoid(10);
                        try {
                            const lobbyData = await redis.get(`quiz:lobby:${roomId}`);
                            const config = lobbyData ? (typeof lobbyData === 'string' ? JSON.parse(lobbyData) : lobbyData) : { topic: 'DSA', difficulty: 'medium', count: 5 };
                            const questions = await getBankedQuestions(config.topic, config.difficulty, config.count);

                            await redis.set(`${ROOM_PREFIX}:${newRoomId}`, JSON.stringify(questions), { ex: 3600 });
                            await redis.set(`quiz:lobby:${newRoomId}`, JSON.stringify(config), { ex: 3600 });

                            await redis.del(rematchKey);
                            io.to(roomId).emit('rematch_start', newRoomId);
                        } catch (err) {
                            console.error("[REMATCH] Error:", err);
                            io.to(roomId).emit('error', 'Failed to start rematch');
                        }
                    } else {
                        await redis.hset(rematchKey, { 'pending_user': userId, 'pending_socket': socket.id });
                        await redis.expire(rematchKey, 300);
                        socket.to(roomId).emit('opponent_wants_rematch');
                    }
                });
            });
        } else {
            // Ensure res.socket.server.io is pointing to the global io if it's already initialized
            res.socket.server.io = (global as any).io;
        }
        res.end();
    } catch (error) {
        console.error("Critical Socket Handler Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export default SocketHandler;