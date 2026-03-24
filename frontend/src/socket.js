import { io } from 'socket.io-client';

export const initSocket = async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://codearena-jjy5.onrender.com';
  
  const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
  };
  
  // Log connection target for debugging deployment
  console.log(`Attempting socket connection to: ${backendUrl}`);
  
  return io(backendUrl, options);
};
