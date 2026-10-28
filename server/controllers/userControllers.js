import User from "../models/userModel.js";
import mongoose from "mongoose";
import Directory from "../models/directoryModel.js";
import OTP from "../models/otpModel.js";

import Session from "../models/sessionModel.js";
import { loginSchema, registerSchema } from "../validators/authSchema.js";

export const secretKey = "123";

export const userRegister = async (req, res, next) => {
   console.log("start of user register route");

   const{success, data, error} = registerSchema.safeParse(req.body)
   console.log(data)
   if(!success){
      return res.status(400).json({
         error : "Invalid input, Enter valid fields"
      })
   }
   const { name, email, password } =data;

   // Do not rely on the disabled browser button: requests can be sent directly.
   const verifiedOtp = await OTP.findOne({ email, verifiedAt: { $ne: null } });
   const otpExpired =
      !verifiedOtp ||
      Date.now() - verifiedOtp.createdAt.getTime() > 10 * 60 * 1000;
   if (otpExpired) {
      if (verifiedOtp) await verifiedOtp.deleteOne();
      return res.status(403).json({
         error: "Verify the email OTP before registering.",
      });
   }

   const foundUser = await User.findOne({ email });
   if (foundUser) {
      return res.status(409).json({
         error: "User already exists",
         message:
            "A user with this email address already exists. Please try logging in or use a different email.",
      });
   }
   const session = await mongoose.startSession();

   // // const salt = crypto.randomBytes(16);

   //    /*// const hashedPassword = crypto.pbkdf2Sync(
   //    //    password,
   //    //    salt,
   //    //    100000,
   //    //    32,
   //    //    "sha256",

   //    // );
   //    // const hashedPassword = crypto
   //    //    .createHash("sha256")
   //    //    .update(password)
   // //    .digest("base64url");*/}
   try {
      const rootDirId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

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
            // password: `${salt.toString("base64url")}.${hashedPassword.toString("base64url")}`,
            password,
            rootDirId,
         },
         { session },
      );

      // commitTransaction()
      await session.commitTransaction();
      await verifiedOtp.deleteOne();
      res.status(201).json({ message: "User Registered" });
   } catch (error) {
      await session.abortTransaction();
      // console.log(error.errInfo.details.schemaRulesNotSatisfied);

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
      picture: req.user.picture,
      role: req.user.role,
   });
};
export const getAllUser = async (req, res) => {
   const allUsers = await User.find({ deleted: false }).lean();
   const allSessions = await Session.find().lean();
   const allSessionsUserId = allSessions.map(({ userId }) => userId.toString());
   const allSessionsUserIdSet = new Set(allSessionsUserId);
   const transformedUsers = allUsers.map(({ _id, name, email }) => {
      return {
         id: _id,
         name,
         email,
         isLoggedIn: allSessionsUserIdSet.has(_id.toString()),
      };
   });
   return res.json(transformedUsers);
};
export const userLogin = async (req, res) => {
   const {success, data, error} = loginSchema.safeParse(req.body)
    if(!success){
      return res.status(400).json({
         error : "Invalid input, Enter valid fields"
      })
   }
   const { email, password } = data;

   // const user = await User.findOne({ email, password }); //we can not find this user like this now as we are using hashing
   const user = await User.findOne({ email });
   if (!user) {
      // console.log(user.rootDirId);
      return res
         .status(404)
         .json({ error: "Invalid credentials, User not found!" });
   }

   // const [salt, savedHashedPassword] = user.password.split(".");

   // console.log({ salt, savedHashedPassword });

   // const enteredPasswordHash = crypto
   //    .pbkdf2Sync(
   //       password,
   //       Buffer.from(salt, "base64url"),
   //       100000,
   //       32,
   //       "sha256",
   //    )
   //    .toString("base64url");

   // console.log({ enteredPasswordHash, savedHashedPassword });

   // // const enteredPasswordHash = crypto
   // //    .createHash("sha256")
   // //    .update(password)
   // //    .digest("base64url");

   // if (savedHashedPassword != enteredPasswordHash) {
   //    return res.status(400).json({ error: "invalid password" });
   // }

   // const userOId = user._id.toString();

   const isPasswordValid = await user.comparePassword(password, user.password);
   if (!isPasswordValid) {
      return res
         .status(404)
         .json({ error: "Invalid Password, Try something else!" });
   } // this functionality has been moved to the pre hook in the user model

   const allSessions = await Session.find({ userId: user.id });

   if (allSessions.length >= 3) {
      await allSessions[0].deleteOne();
   }

   const session = await Session.create({ userId: user._id });
   // ----> Implementing Redis in the application

   // const sessionId = crypto.randomUUID();
   // const redisKey = `session:${crypto.randomUUID()}`;
   // await redisClient.json.set(redisKey, "$", { userId: user._id });

   res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
   });
   // const cookiePayload = JSON.stringify({
   //    id: user._id.toString(),
   //    expiry: Math.round((Date.now() / 1000) * 60 * 60 * 24 * 7),
   // });

   // const signature = crypto
   //    .createHash("sha256")
   //    .update(cookiePayload)
   //    .update(secretKey)
   //    .digest("base64url");

   // const signedCookiePayload = `${Buffer.from(cookiePayload).toString("base64url")}.${signature}`;
   // console.log({ signedCookiePayload });

   return res.json({ message: "logged in" });
};

export const userLogout = async (req, res) => {
   // res.cookie("sid", "", {
   //    maxAge: 0,
   // });
   //we can also use clearCookie() --> This will clear the cookie from the client
   const { sid } = req.signedCookies;
   console.log({ sid });
   await Session.findByIdAndDelete(sid);
   res.clearCookie("sid");
   return res.status(200).json({ message: "User logged out !" });
};
export const userLogoutAll = async (req, res) => {
   const { sid } = req.signedCookies;
   console.log({ sid });
   const session = await Session.findById(sid);
   await Session.deleteMany({ userId: session.userId });
   res.clearCookie("sid");
   return res.status(200).json({ message: "User logged out !" });
};

export const logoutById = async (req, res, next) => {
   console.log({ params: req.params });

   try {
      await Session.deleteMany({ userId: req.params.userId });
      return res.status(204).end();
   } catch (error) {
      next(error);
   }
};

export const deleteUserByAdmin = async (req, res, next) => {
   const { userId } = req.params;
   if (req.user._id.toString() == userId) {
      return res.status(403).json({ error: "You can not delete yourself" });
   }
   try {
      // Below code is deleting the user completely but we will implement soft delete
      // await User.deleteOne({ _id: userId });
      // await Directory.deleteMany({ userId });
      // await File.deleteMany({ userId });

      await User.findByIdAndUpdate(userId, { deleted: true });
      await Session.deleteMany({ userId });
      return res.status(204).end();
   } catch (error) {
      next(error);
   }
};
