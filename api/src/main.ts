import fs from 'fs';
import https from 'https';
import { createServer } from "http";
import path from 'path';

import * as bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import auth from './routes/auth';
import comm from './routes/communication';

import { Server } from "socket.io";

import {calculateAggregate} from "./hume/face";

dotenv.config();
/*
 APP_KEY, and APP_SECRET should be on pair with example application values since we are working on current conference bounded with those values
 */
const { PORT, HOSTNAME, SSL, KEY, SECRET } = process.env;

if (!KEY || !SECRET) {
  throw new Error('KEY and SECRET variables are mandatory');
}

const app = express();

// eslint-disable-next-line new-cap
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(auth);
app.use(comm);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let server = null;


server = createServer(app);
server.listen(PORT, () => {
  console.log(`Listening at http://${HOSTNAME}:${PORT}/`);
});
server.on('error handler', console.error);

const socket_server = createServer();
const io = new Server(socket_server, {
  cors: {
    origin: "http://localhost:3000",
    
  }});

console.log("socket created");
socket_server.listen(3001, () => {
  console.log(`Socket server listening at http://${HOSTNAME}:3001`);
});

io.on('connection', (socket) => {
  console.log("connected");

  socket.on('face', (data) => {
    
    calculateAggregate(data);

  });
});

function sendMaxData(data: Array<string>){
    io.emit("face_emit", data); 
}

export {sendMaxData}; 



process.on('SIGTERM', () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  server.close(() => {
    console.log('Http server closed.');
  });
});
