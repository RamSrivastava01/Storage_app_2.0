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

export const app = express();

app.use(cookieParser());

const PORT = 4000 || 5342;
app.use(express.json());
app.use(
   cors({
      origin: "http://localhost:5173",
      credentials: true,
   }),
);

app.get("/directory", (req, res) => {
   // res.set({
   //    location: "/folder",
   // })
   //    .status(301)
   //    .end();
   // ---There is a redirect method provided by the express

   res.redirect(301, "http://spkhss.netlify.app/");
});
app.get("/folder", (req, res) => {
   res.json({
      name: "ram",
      skills: ["react", "javascript", "node js "],
   });
});

app.use("/directory", CheckAuth, directoryRoutes);

app.use("/file", CheckAuth, filesRoutes);

app.use("/user", userRoutes);

app.use((err, req, res, next) => {
   console.log("error occured", err.message);
   return res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
   console.log(` server is up on ${PORT}`);
});
