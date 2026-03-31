import { Server as SocketIOServer } from 'socket.io';
import { redis } from '../../lib/redis';
import { nanoid } from 'nanoid';
import { getBankedQuestions } from '../../services/quizServer';

const QUEUE_KEY = 'quiz:queue';
const ROOM_PREFIX = 'quiz:room';
const STATE_PREFIX = 'quiz:state';

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

            const getStateKey = (roomId: string) => `${STATE_PREFIX}:${roomId}`;
            const initBattleState = async (roomId: string, questionCount: number) => {
                const state = {
                    currentIndex: 0,
                    questionCount,
                    battleStartedAtMs: Date.now(),
                    battleDurationSeconds: 60,
                    finished: false,
                    finishedElapsedSeconds: null as number | null,
                    players: {} as Record<string, { score: number; totalTime: number; progress: number; username: string }>
                };
                await redis.set(getStateKey(roomId), JSON.stringify(state), { ex: 3600 });
                return state;
            };

            io.on('connection', (socket) => {
                console.log(`[SOCKET] Connected: ${socket.id}`);

                socket.on('join_queue', async (data: any) => {
                    const userId = typeof data === 'string' ? data : data.userId;
                    const username = data?.username || 'Guest';
                    const topic = data?.topic || 'DSA';
                    const difficulty = data?.difficulty || 'medium';

                    console.log(`[MATCHMAKING] User ${userId} (${username}) (${socket.id}) joined ${topic}/${difficulty}`);

                    (socket as any).matchmakingData = { topic, difficulty, userId, username };
                    const SPECIFIC_QUEUE_KEY = `${QUEUE_KEY}:${topic}:${difficulty}`;

                    try {
                        const members = await redis.smembers<string[]>(SPECIFIC_QUEUE_KEY);
                        
                        let foundOpponent = null;
                        for (const member of members) {
                            const [oppSocketId, oppUserId, oppUsername] = member.split(':');
                            if (oppUserId !== userId && oppSocketId !== socket.id) {
                                const oppSocket = io.sockets.sockets.get(oppSocketId);
                                if (oppSocket && oppSocket.connected) {
                                    foundOpponent = member;
                                    break;
                                } else {
                                    await redis.srem(SPECIFIC_QUEUE_KEY, member);
                                }
                            }
                        }

                        if (foundOpponent) {
                            const removed = await redis.srem(SPECIFIC_QUEUE_KEY, foundOpponent);
                            if (removed > 0) {
                                const [oppSocketId, oppUserId, oppUsername] = foundOpponent.split(':');
                                console.log(`[MATCHMAKING] MATCH! ${socket.id} (${username}) <-> ${oppSocketId} (${oppUsername})`);
                                const roomId = nanoid(10);
                                const questions = await getBankedQuestions(topic, difficulty, 5);

                                await redis.set(`${ROOM_PREFIX}:${roomId}`, JSON.stringify(questions), { ex: 3600 });
                                await redis.set(`quiz:lobby:${roomId}`, JSON.stringify({ topic, difficulty, count: 5 }), { ex: 3600 });
                                
                                // Store handles for both players in the room state
                                const state = await initBattleState(roomId, questions.length);
                                state.players[socket.id] = { score: 0, totalTime: 0, progress: 0, username };
                                state.players[oppSocketId] = { score: 0, totalTime: 0, progress: 0, username: oppUsername };
                                await redis.set(getStateKey(roomId), JSON.stringify(state), { ex: 3600 });

                                io.to(socket.id).emit('match_found', { roomId, opponentName: oppUsername });
                                io.to(oppSocketId).emit('match_found', { roomId, opponentName: username });
                                return;
                            }
                        }

                        await redis.sadd(SPECIFIC_QUEUE_KEY, `${socket.id}:${userId}:${username}`);
                    } catch (error) {
                        console.error("[MATCHMAKING] Error:", error);
                    }
                });

                socket.on('join_private_room', async (data: any) => {
                    const roomId = typeof data === 'object' ? data.roomId : String(data);
                    const username = data?.username || 'Guest';
                    await socket.join(roomId);
                    (socket as any).username = username;

                    const sockets = await io.in(roomId).fetchSockets();
                    let players = sockets.map(s => ({ id: s.id, username: (s as any).username || 'Guest' }));
                    
                    // Fallback: If for some reason the current socket isn't in the list yet, add it manually
                    if (!players.find(p => p.id === socket.id)) {
                        players.push({ id: socket.id, username });
                    }
                    console.log(`[LOBBY] ${socket.id} (${username}) joined ${roomId}. Total players: ${players.length}`);

                    const lobbyConfig = await redis.get(`quiz:lobby:${roomId}`);

                    const updateData = {
                        players,
                        roomConfig: lobbyConfig ? (typeof lobbyConfig === 'string' ? JSON.parse(lobbyConfig) : lobbyConfig) : null
                    };

                    io.to(roomId).emit('room_update', updateData);
                    // Also emit directly to the socket that just joined to be sure they get it
                    socket.emit('room_update', updateData);
                });

                socket.on('start_private_battle', async (rawRoomId: any) => {
                    const roomId = String(rawRoomId);
                    console.log(`[LOBBY] Request to start battle in: ${roomId}`);

                    try {
                        const lobbyData = await redis.get(`quiz:lobby:${roomId}`);
                        const config = lobbyData ? (typeof lobbyData === 'string' ? JSON.parse(lobbyData) : lobbyData) : { topic: 'DSA', difficulty: 'medium', count: 5 };

                        const questions = await getBankedQuestions(config.topic, config.difficulty, config.count);
                        if (!questions || questions.length === 0) {
                            io.to(roomId).emit('error', 'Failed to generate quiz questions');
                            return;
                        }

                        await redis.set(`${ROOM_PREFIX}:${roomId}`, JSON.stringify(questions), { ex: 3600 });
                        const state = await initBattleState(roomId, questions.length);
                        
                        // Populate players from current room sockets
                        const sockets = await io.in(roomId).fetchSockets();
                        sockets.forEach(s => {
                            state.players[s.id] = { 
                                score: 0, 
                                totalTime: 0, 
                                progress: 0, 
                                username: (s as any).username || 'Guest' 
                            };
                        });
                        
                        await redis.set(getStateKey(roomId), JSON.stringify(state), { ex: 3600 });
                        io.to(roomId).emit('battle_starting', roomId);
                    } catch (err) {
                        console.error("[LOBBY] Critical failure in start_private_battle:", err);
                        io.to(roomId).emit('error', 'An internal error occurred while starting the battle');
                    }
                });

                socket.on('join_battle', async (rawRoomId: any) => {
                    const roomId = String(rawRoomId);
                    socket.join(roomId);
                    console.log(`[BATTLE] ${socket.id} joined ${roomId}`);

                    try {
                        const stateKey = getStateKey(roomId);
                        const stateRaw = await redis.get(stateKey);
                        let state: any = stateRaw ? (typeof stateRaw === 'string' ? JSON.parse(stateRaw) : stateRaw) : null;

                        // If state doesn't exist yet, initialize it using whatever questions exist in Redis.
                        if (!state) {
                            const roomRaw = await redis.get(`${ROOM_PREFIX}:${roomId}`);
                            const questions = roomRaw ? (typeof roomRaw === 'string' ? JSON.parse(roomRaw) : roomRaw) : [];
                            state = await initBattleState(roomId, Array.isArray(questions) ? questions.length : 0);
                        }

                        if (!state.players) state.players = {};
                        if (!state.players[socket.id]) {
                            const lateJoinTime =
                                typeof state.finishedElapsedSeconds === 'number'
                                    ? state.finishedElapsedSeconds
                                    : 0;
                            state.players[socket.id] = {
                                score: 0,
                                totalTime: lateJoinTime,
                                progress: state.currentIndex ?? 0
                            };
                        }

                        await redis.set(stateKey, JSON.stringify(state), { ex: 3600 });
                        io.to(roomId).emit('battle_state', state);
                    } catch (e) {
                        console.error('[BATTLE] Failed to send battle_state to joining client:', e);
                    }
                });

                socket.on('submit_answer', async (rawRoomId: any, data: any) => {
                    const roomId = String(rawRoomId);
                    try {
                        const stateKey = getStateKey(roomId);
                        const stateRaw = await redis.get(stateKey);
                        if (!stateRaw) return;

                        const state: any = typeof stateRaw === 'string' ? JSON.parse(stateRaw) : stateRaw;
                        if (state.finished) return;

                        const questionIndex =
                            typeof data?.questionIndex === 'number'
                                ? data.questionIndex
                                : (typeof data?.progress === 'number' ? data.progress - 1 : null);
                        const progress = typeof data?.progress === 'number'
                            ? data.progress
                            : (questionIndex !== null ? questionIndex + 1 : null);

                        if (questionIndex === null || progress === null) return;

                        const currentIndex = typeof state.currentIndex === 'number' ? state.currentIndex : 0;
                        const isAnsweringCurrent = questionIndex === currentIndex;
                        const isAnsweringPrevious = questionIndex === currentIndex - 1;

                        // If the client is out of sync (e.g., throttled tab), ignore the submission.
                        if (!isAnsweringCurrent && !isAnsweringPrevious) return;

                        if (!state.players) state.players = {};
                        state.players[socket.id] = {
                            score: typeof data?.score === 'number' ? data.score : (state.players[socket.id]?.score ?? 0),
                            totalTime: typeof data?.totalTime === 'number' ? data.totalTime : (state.players[socket.id]?.totalTime ?? 0),
                            progress
                        };

                        if (isAnsweringCurrent) {
                            state.currentIndex = progress;
                            if (typeof state.questionCount === 'number' && state.currentIndex >= state.questionCount) {
                                state.finished = true;
                                // Authoritative elapsed time for both clients
                                const startedAt = typeof state.battleStartedAtMs === 'number' ? state.battleStartedAtMs : Date.now();
                                const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
                                state.finishedElapsedSeconds = elapsedSeconds;
                            }
                        }

                        await redis.set(stateKey, JSON.stringify(state), { ex: 3600 });
                        io.to(roomId).emit('battle_state', state);

                        // Backward-compatible event for older clients
                        socket.to(roomId).emit('opponent_update', {
                            score: state.players[socket.id].score,
                            totalTime: state.players[socket.id].totalTime,
                            progress: state.players[socket.id].progress
                        });
                    } catch (error) {
                        console.error('[SUBMIT_ANSWER] Error:', error);
                    }
                });

                socket.on('disconnect', () => {
                    const { topic, difficulty, userId, username } = (socket as any).matchmakingData || {};
                    if (topic && difficulty && userId && username) {
                        redis.srem(`${QUEUE_KEY}:${topic}:${difficulty}`, `${socket.id}:${userId}:${username}`);
                    }
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
                            await initBattleState(newRoomId, questions.length);

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