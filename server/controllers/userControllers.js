import User from "../models/userModel.js";
import mongoose, { Mongoose, Schema, Types } from "mongoose";
import Directory from "../models/directoryModel.js";
import crypto from "crypto";

export const secretKey = "123";

export const userRegister = async (req, res, next) => {
   console.log("start of user register route");
   const { name, email, password } = req.body;

   const foundUser = await User.findOne({ email });
   if (foundUser) {
      return res.status(409).json({
         error: "User already exists",
         message:
            "A user with this email address already exists. Please try logging in or use a different email.",
      });
   }
   const session = await mongoose.startSession();

   const salt = crypto.randomBytes(16);

   const hashedPassword = crypto.pbkdf2Sync(
      password,
      salt,
      100000,
      32,
      "sha256",
   );
   // const hashedPassword = crypto
   //    .createHash("sha256")
   //    .update(password)
   //    .digest("base64url");
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
            password: `${salt.toString("base64url")}.${hashedPassword.toString("base64url")}`,
            rootDirId,
         },
         { session },
      );

      // commitTransaction()
      await session.commitTransaction();
      res.status(201).json({ message: "User Registered" });
   } catch (error) {
      await session.abortTransaction();
      // console.log(error.errInfo.details.schemaRulesNotSatisfied);
      console.log(error);
      if (error.code == 121) {
         res.status(400).json({
            error: "Invalid fields while Registering user",
         });
      } else if (error.code === 11000 && error.keyValue.email) {
         return res.status(409).json({
            error: "User already exists",
            message:
               "A user with this email address already exists. Please try logging in or use a different email.",
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

   // const user = await User.findOne({ email, password }); //we can not find this user like this now as we are using hashing
   const user = await User.findOne({ email });
   if (!user) {
      // console.log(user.rootDirId);
      return res
         .status(404)
         .json({ error: "Invalid credentials, User not found!" });
   }

   const [salt, savedHashedPassword] = user.password.split(".");

   console.log({ salt, savedHashedPassword });

   const enteredPasswordHash = crypto
      .pbkdf2Sync(
         password,
         Buffer.from(salt, "base64url"),
         100000,
         32,
         "sha256",
      )
      .toString("base64url");

   console.log({ enteredPasswordHash, savedHashedPassword });

   // const enteredPasswordHash = crypto
   //    .createHash("sha256")
   //    .update(password)
   //    .digest("base64url");

   if (savedHashedPassword != enteredPasswordHash) {
      return res.status(400).json({ error: "invalid password" });
   }

   // const userOId = user._id.toString();
   const cookiePayload = JSON.stringify({
      id: user._id.toString(),
      expiry: Math.round(Date.now() / 1000 + 10),
   });

   // const signature = crypto
   //    .createHash("sha256")
   //    .update(cookiePayload)
   //    .update(secretKey)
   //    .digest("base64url");

   // const signedCookiePayload = `${Buffer.from(cookiePayload).toString("base64url")}.${signature}`;
   // console.log({ signedCookiePayload });

   res.cookie("token", cookiePayload, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
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
