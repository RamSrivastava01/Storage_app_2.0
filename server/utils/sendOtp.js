import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";

export async function sendOtp(email) {
   const otp = Math.floor(1000 + Math.random() * 9000).toString();
   await OTP.findOneAndUpdate(
      { email },
      // A newly issued OTP invalidates a verification for an older one.
      { otp, createdAt: new Date(), verifiedAt: null },
      { upsert: true },
   );

   const html = `
      <h2>Your OTP is : ${otp}</h2>
      <p>This otp is valid for 10 mins</p>
   `;
   try {
      const transporter = nodemailer.createTransport({
         host: "smtp.gmail.com",
         port: 587,

         auth: {
            user: "ramsrivastava20@gmail.com",
            pass: "zvld iilc cper tnxk",
         },
      });
      const info = await transporter.sendMail({
         from: '"storage app Team" <ramsrivastava20@gmail.com>', // sender address
         to: email, // list of recipients
         subject: "OTP", // subject line
         // text: "Nodemailer has been used to use the     f email services",  // plain text body
         html: html, // HTML body
      });

      console.log("Message sent: %s", info.messageId);
   } catch (err) {
      console.error("Error while sending mail:", err);
   }

   return { success: true, message: "OTP sent successfully" };
}
