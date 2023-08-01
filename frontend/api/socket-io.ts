import { io } from 'socket.io-client';

export const socket = io(
  process.env.NEXT_PUBLIC_APP_HOST
    ? process.env.NEXT_PUBLIC_APP_HOST
    : 'http://localhost:4000',
  {
    transports: ['websocket'],
  },
);
