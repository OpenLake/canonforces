import React, {createContext,useContext,useEffect,useState,ReactNode} from 'react';
import {io,Socket} from 'socket.io-client';

type SocketContextType={socket: Socket | null; isConnected:boolean;};
const SocketContext=createContext<SocketContextType>({socket:null,isConnected:false});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider=({children}:{children:ReactNode})=>{
    const [socket,setSocket]=useState<Socket |null>(null);
    const [isConnected,setIsConnected] = useState(false);

    useEffect(() => {
        let socketInstance: Socket | null = null;

        // Initialize socket server by calling the API route once
        const initSocket = async () => {
            try {
                await fetch('/api/socket');
                socketInstance = io({ path: '/api/socket', addTrailingSlash: false });
                
                socketInstance.on('connect', () => setIsConnected(true));
                socketInstance.on('disconnect', () => setIsConnected(false));
                
                setSocket(socketInstance);
            } catch (err) {
                console.error("Socket initialization failed:", err);
            }
        };

        initSocket();

        return () => {
            if (socketInstance) socketInstance.disconnect();
        };
    }, []);
    return (
        <SocketContext.Provider value={{socket,isConnected}}>
            {children}
            </SocketContext.Provider>
    );
};