import express from "express";
import { createWriteStream } from "fs";
import { mkdir, readdir, rename, rm, stat } from "fs/promises";
import cors from "cors";
import path, { dirname, join } from "path";
import cookieParser from "cookie-parser";
import directoryRoutes from "./Routes/directoryRoutes.js";
import filesRoutes from "./Routes/filesRoutes.js";
import userRoutes from './Routes/userRoutes.js'
export const app = express();

app.use(cookieParser())

const PORT = 8080 || 5342;
app.use(express.json());
app.use(cors({
   origin: 'http://localhost:5173',
   credentials: true
}));




app.use("/directory", directoryRoutes)

app.use("/file", filesRoutes)

app.use("/user", userRoutes)

app.use((err, req, res, next) => {
   console.log("error occured", err.message)
   res.status(500).json({ error: "Internal Server Error" });
})

app.listen(PORT, () => {

   console.log(` server is up on ${PORT}`);
});
