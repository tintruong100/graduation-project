import express from "express";
import bodyParser from "body-parser";
import initWebRoutes from "./routes/web";
import connectDB from "./config/connectDB";
import cors from "cors";
import initSocketIO from "./sockets/socketHandler";
import http from "http";
const { Server } = require("socket.io");

require('dotenv').config();

let app = express();
let server = http.createServer(app);
app.use(cors({
    origin: '*', // Next.js app origin
    credentials: true                 // allow cookies/auth
}))

const io = new Server(server, { cors: { origin: '*' } });

//config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

initWebRoutes(app);
initSocketIO(server);

connectDB();

let port = process.env.PORT || 8000;
//port === undefined => port = 8000

app.listen(port, () => {
    //callback
    console.log(`Backend Nodejs is running at port ${port}`);
});
server.listen(8001, () => {
    console.log("Backend & Socket.IO đang chạy tại port 8001");
});