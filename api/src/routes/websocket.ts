import { io } from "../main";



io.on('connection', (socket) => {
    console.log("user connected");
});