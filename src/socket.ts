import { io } from 'socket.io-client';
// const a = require('socket.io-client');

// const { VITE_PROXY_PROTOCOL, VITE_API_PROXY, VITE_PROXY_PORT } = import.meta.env;
// "undefined" means the URL will be computed from the `window.location` object
// const URL = `${VITE_PROXY_PROTOCOL}://${VITE_API_PROXY}:3001`;
const URL = "http://localhost:3001";
// export const socket = a.io(URL);
// const socket = a.io(URL);
export const socket = io(URL);