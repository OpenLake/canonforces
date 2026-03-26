import { Server as SocketIOServer } from 'socket.io';
import { redis } from '../../lib/redis';
import { nanoid } from 'nanoid';
import { getBankedQuestions } from '../../services/quizServer';

const QUEUE_KEY = 'quiz:queue';
const ROOM_PREFIX = 'quiz:room';

const SocketHandler = (req: any, res: any) => {
    try {
        if (!res.socket.server.io) {
            console.log("Initializing Socket.io server...");
            const io = new SocketIOServer(res.socket.server, { 
                path: '/api/socket', 
                addTrailingSlash: false,
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            });
            res.socket.server.io = io;
            
            io.on('connection', async (socket) => {
            console.log("new Connection:", socket.id);
            // Random matcmaking
                socket.on('join_queue', async (userId: string) => {
                    console.log("User joined queue:", userId, "Socket ID:", socket.id);
                    try {
                        const opponent = await redis.spop<string>(QUEUE_KEY);
                        if (opponent && opponent !== socket.id) {
                            console.log("Match found between", socket.id, "and", opponent);
                            const roomId = nanoid(10);
                            const questions = await getBankedQuestions('DSA', 'medium', 5);
                            await redis.set(`${ROOM_PREFIX}${roomId}`, JSON.stringify(questions), { ex: 3600 });
                            io.to(socket.id).emit('match_found', roomId);
                            io.to(opponent).emit('match_found', roomId);
                        } else {
                            console.log("No opponent found, adding to queue:", socket.id);
                            await redis.sadd(QUEUE_KEY, socket.id);
                        }
                    } catch (error) {
                        console.error("Matchmaking error:", error);
                    }
                });
                // battle sync
                socket.on('join_battle', (roomId: string) => {
                    socket.join(roomId);
                console.log("user joined room", roomId);
                });
                socket.on('submit_answer', (roomId: string, isCorrect: boolean) => {
                    socket.to(roomId).emit('opponent_update', { isCorrect });
                });
                socket.on('disconnect', () => {
                    console.log("Socket disconnected:", socket.id);
                    redis.srem(QUEUE_KEY, socket.id);
                });
               socket.on('join_private_room',async (roomId:string)=>{
                socket.join(roomId);
                socket.to(roomId).emit('player_joined',socket.id);
                console.log("player joined private room",roomId);
               });
               socket.on('start_private_battle',async (roomId:string)=>{
                const questions=await getBankedQuestions('DSA','medium',5);
                await redis.set(`${ROOM_PREFIX}${roomId}`,JSON.stringify(questions),{ex:3600});
                io.to(roomId).emit('battle_starting',roomId);
                console.log(`Battle Starting in room: ${roomId}`);
               })
            });


        }
        res.end();
    } catch (error) {
        console.error("Critical Socket Handler Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) });
    }
};
export default SocketHandler;