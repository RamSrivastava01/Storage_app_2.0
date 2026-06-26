import express from "express";
import cors from "cors";
import crypto from "crypto";
import directoriesData from "../directoriesDB.json" with { type: "json" };

import { writeFile } from "fs/promises";
import CheckAuth from "../middlewares/auth.js";
import { Db } from "mongodb";
/** @type {import('mongodb').Db} */
const router = express.Router();

//use cookie parser for parsing the request from the browser
// use command npm i cookie-

// File Post Route

router.post("/register", async (req, res, next) => {
   const { name, email, password } = req.body;

   const db = req.db;
   const foundUser = await db.collection("users").findOne({ email });

   if (foundUser) {
      return res.status(409).json({ error: "User already exists" });
   }

   try {
      const userRootDir = await db.collection("directories").insertOne({
         name: `root-${email}`,

         parentDirId: null,
         files: [],
         directories: [],
      });

      const rootDirId = userRootDir.insertedId;
      // console.log(userRootDir);
      const createdUser = await db.collection("users").insertOne({
         name,
         email,
         password,
         rootDirId,
      });
      const userId = createdUser.insertedId;
      await db
         .collection("directories")
         .updateOne({ _id: rootDirId }, { $set: { userId } });
      res.status(201).json({ message: `User created with ID ${userId}` });
   } catch (error) {
      next(error);
   }
});

// GET user route

router.get("/", CheckAuth, async (req, res) => {
   return res.status(200).json({
      name: req.user.name,
      email: req.user.email,
   });
});

router.post("/login", async (req, res) => {
   const { email, password } = req.body;
   const db = req.db;

   const user = await db.collection("users").findOne({ email, password });

   // console.log(user.rootDirId);
   if (!user) {
      return res.status(404).json({ error: "Invalid credentials" });
   }

   const userOId = user._id.toString();
   console.log({ userOId });

   res.cookie("uid", userOId, {
      httpOnly: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
      sameSite: "lax",
   });

   res.json({ message: "logged in" });
});

router.post("/logout", (req, res) => {
   res.cookie("uid", "", {
      maxAge: 0,
   });

   //we can also use clearCookie() --> This will clear the cookie from the client
   res.status(200).json({ message: "User logged out !" });
});

export default router;
