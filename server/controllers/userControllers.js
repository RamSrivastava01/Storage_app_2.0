import { client } from "../config/db.js";
import User from "../models/userModel.js";
import mongoose, { Mongoose, Schema, Types } from "mongoose";
import Directory from "../models/directoryModel.js";

export const userRegister = async (req, res, next) => {
   console.log("start of user register route");
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
   const session = await mongoose.startSession();

   try {
      const rootDirId = new Types.ObjectId();
      const userId = new Types.ObjectId();

      // startTransaction()
      session.startTransaction();

      await Directory.insertOne(
         {
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId,
         },
         { session },
      );

      await User.insertOne(
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
};

export const getUser = async (req, res) => {
   return res.status(200).json({
      name: req.user.name,
      email: req.user.email,
   });
};

export const userLogin = async (req, res) => {
   const { email, password } = req.body;

   const user = await User.findOne({ email, password });

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
};

export const userLogout = (req, res) => {
   res.cookie("uid", "", {
      maxAge: 0,
   });

   //we can also use clearCookie() --> This will clear the cookie from the client
   res.status(200).json({ message: "User logged out !" });
};
