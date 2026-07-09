import express from "express";
import cors from "cors";

import { rm, writeFile } from "fs/promises";
import CheckAuth from "../middlewares/auth.js";
import { Db, ObjectId } from "mongodb";
import { client } from "../config/db.js";

const router = express.Router();

//use cookie parser for parsing the request from the browser
// use command npm i cookie-

// File Post Route

router.post("/register", async (req, res, next) => {
   const { name, email, password } = req.body;
   const db = req.db;
   const foundUser = await db.collection("users").findOne({ email });
   if (foundUser) {
      return res.status(409).json({
         error: "User already exists",
         message:
            "A user with this email address already exists. Please try logging in or use a different email.",
      });
   }
   const session = client.startSession();

   try {
      const rootDirId = new ObjectId();
      const userId = new ObjectId();
      const dirCollection = db.collection("directories");

      // startTransaction()
      session.startTransaction();

      await dirCollection.insertOne(
         {
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId,
         },
         { session },
      );

      await db.collection("users").insertOne(
         {
            _id: userId,
            name,
            email,
            password,
            rootDirId,
         },
         { session },
      );

      // commitTransaction()
      await session.commitTransaction();
      res.status(201).json({ message: "User Registered" });
   } catch (error) {
      await session.abortTransaction();
      if (error.code == 121) {
         res.status(400).json({
            error: "Invalid fields while Registering user",
         });
      } else {
         next(error);
      }
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
