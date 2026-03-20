import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import connectDB from "./config/connectDB";
import cors from "cors";

require('dotenv').config();

let app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Next.js app origin
    credentials: true                 // allow cookies/auth
}))

//config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 8000;
//port === undefined => port = 8000

app.listen(port, () => {
    //callback
    console.log(`Backend Nodejs is running at port ${port}`);
});