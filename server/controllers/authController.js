import OTP from "../models/otpModel.js";
import { verifyIdToken } from "../utils/googleAuthService.js";
import { sendOtp } from "../utils/sendOtp.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import Directory from "../models/directoryModel.js";
import Session from "../models/sessionModel.js";
import { otpSchema } from "../validators/authSchema.js";

export async function sendOtpController(req, res, next) {
   try {
      const { email } = req.body;

      if (!email) {
         return res.status(400).json({ error: "Email is required." });
      }

      const response = await sendOtp(email);
      return res.status(200).json(response);
   } catch (error) {
      return next(error);
   }
}

export async function verifyOtpController(req, res, next) {
   const {success, data, error} = otpSchema(req.body)
   if(!success){
      return res.status(400).json({
         error : "Enter a valid OTP for verification"
      })
   }
   try {
      const { email, otp } = req.body;

      if (!email || !otp) {
         return res.status(400).json({ error: "Email and OTP are required." });
      }

      const savedOtp = await OTP.findOne({ email });

      if (!savedOtp) {
         return res
            .status(400)
            .json({ error: "OTP has expired or was not found." });
      }

      const hasExpired =
         Date.now() - savedOtp.createdAt.getTime() > 10 * 60 * 1000;
      if (hasExpired) {
         await savedOtp.deleteOne();
         return res
            .status(400)
            .json({ error: "OTP has expired. Please request a new one." });
      }

      if (savedOtp.otp !== otp) {
         return res.status(400).json({ error: "Invalid OTP." });
      }

      // Keep this short-lived record so the registration endpoint can enforce
      // that this email, rather than just the browser UI, completed verification.
      savedOtp.verifiedAt = new Date();
      await savedOtp.save();
      return res.status(200).json({ message: "OTP verified successfully." });
   } catch (error) {
      return next(error);
   }
}

//Login with google controller

export const loginWithGoogle = async (req, res, next) => {
   const { idToken } = req.body;

   const userData = await verifyIdToken(idToken);
   const { name, email, picture, sub } = userData;
   const user = await User.findOne({ email }).lean();
   if (user) {
      if (user.deleted) {
         return res.status(403).json({ error: "You account has been deleted" });
      }
      const allSessions = await Session.find({ userId: user.id });
      console.log({ allSessions });
      if (allSessions.length >= 3) {
         await allSessions[0].deleteOne();
      }

      const session = await Session.create({ userId: user._id });

      res.cookie("sid", session.id, {
         httpOnly: true,
         signed: true,
         maxAge: 60 * 1000 * 60 * 24 * 7,
      });
      return res.json({ message: "logged inn" });
   }

   //Initializing the transaction
   const mongooseSession = await mongoose.startSession();

   try {
      const rootDirId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      mongooseSession.startTransaction();
      // startTransaction()

      await Directory.insertOne(
         {
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId,
         },
         { session: mongooseSession },
      );

      const newUser = await User.insertOne(
         {
            _id: userId,
            name,
            email,
            picture,
            rootDirId,
         },
         { session: mongooseSession },
      );

      //finding session
      const allSessions = await Session.find({ userId });
      console.log({ allSessions });
      if (allSessions.length >= 3) {
         await allSessions[0].deleteOne();
      }

      const session = await Session.create({ userId });

      res.cookie("sid", session.id, {
         httpOnly: true,
         signed: true,
         maxAge: 60 * 1000 * 60 * 24 * 7,
      });
      await mongooseSession.commitTransaction();

      return res.json({ message: "logged in with new user" });

      // res.status(201).json(newUser);
   } catch (error) {
      await mongooseSession.abortTransaction();

      next(error);
   } finally {
      mongooseSession.endSession();
   }
};
