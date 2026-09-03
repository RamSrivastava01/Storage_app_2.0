import { secretKey } from "../controllers/userControllers.js";
import User from "../models/userModel.js";
import crypto from "crypto";

export default async function CheckAuth(req, res, next) {
   const { token } = req.signedCookies;

   if (!token) {
      res.clearCookie("token");
      return res.status(401).json({ error: "User Not Logged In" });
   }
   const [payload, oldSignature] = token.split(".");
   // let { id, expiry: expiryTimeInSeconds } = JSON.parse(
   //    Buffer.from(payload, "base64url").toString(),
   // );

   let { id, expiry: expiryTimeInSeconds } = JSON.parse(token);

   expiryTimeInSeconds = Math.round(parseInt(expiryTimeInSeconds));
   // console.log({ expiryTimeInSeconds });
   const jsonPayload = Buffer.from(payload, "base64url").toString();
   // const newSignature = crypto
   //    .createHash("sha256")
   //    .update(jsonPayload)
   //    .update(secretKey)
   //    .digest("base64url");
   // // console.log({ newSignature, oldSignature });
   // if (oldSignature != newSignature) {
   //    res.clearCookie("token");
   //    return res.status(401).json({ error: "Not logged in" });
   // }
   const currentTimeInSeconds = Date.now() / 1000;

   if (currentTimeInSeconds > expiryTimeInSeconds) {
      res.clearCookie("token");
      return res.status(204).json({ error: "Not logged in !" });
   }
   // console.log({ expiryTimeInSeconds, currentTimeInSeconds });
   const user = await User.findOne({ _id: id }).lean();
   console.log({ user });
   if (!user) {
      return res.status(401).json({ error: "User Not Logged In" });
   }
   req.user = user;
   next();
}
