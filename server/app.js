import express from "express";
import { createWriteStream } from "fs";
import { mkdir, readdir, rename, rm, stat } from "fs/promises";
import cors from "cors";
import path, { dirname, join } from "path";
import cookieParser from "cookie-parser";
import directoryRoutes from "./Routes/directoryRoutes.js";
import filesRoutes from "./Routes/filesRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import CheckAuth from "./middlewares/auth.js";
import { connectDb } from "../config/db.js";

try {
   const db = await connectDb();
   const app = express();

   app.use(cookieParser());

   const PORT = 4000;
   app.use(express.json());
   // const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

   app.use(
      cors({
         // Dynamically allow whatever origin is making the request
         origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            return callback(null, true);
         },
         credentials: true, // This allows the cookies/credentials to pass through
      }),
   );

   app.use((req, res, next) => {
      req.db = db;
      next();
   });

   app.use("/directory", CheckAuth, directoryRoutes);

   app.use("/file", CheckAuth, filesRoutes);

   app.use("/user", userRoutes);

   app.use((err, req, res, next) => {
      console.log("error occurred", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
   });

   app.listen(PORT, () => {
      console.log(` server is up on ${PORT}`);
   });
} catch (error) {
   console.log("couldn't connect to database");
   console.log(error);
}
