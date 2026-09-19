import OTP from "../models/otpModel.js";
import { sendOtp } from "../utils/sendOtp.js";

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
