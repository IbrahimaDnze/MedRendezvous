// Utilitaire pour initialiser le client Socket.IO
import { io } from 'socket.io-client';
import API_BASE_URL from '../config/api';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE_URL;

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
};