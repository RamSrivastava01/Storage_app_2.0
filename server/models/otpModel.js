import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
   email: {
      type: String,
      required: true,
      unique: true,
   },

   otp: {
      type: String,
      required: true,
   },
   // An OTP must be verified before the associated email can register.
   verifiedAt: {
      type: Date,
      default: null,
   },
   createdAt: {
      type: Date,
      default: Date.now,
      expired: 600,
   },
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
