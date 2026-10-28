import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";

export default async function CheckAuth(req, res, next) {
   const { sid } = req.signedCookies;

   if (!sid) {
      res.clearCookie("sid");
      return res.status(401).json({ error: "User Not Logged In" });
   }

   const session = await Session.findById(sid);
   console.log({ session });
   if (!session) {
      res.clearCookie("sid");

      return res.status(401).json({
         error: "Not logged in",
      });
   }

   // let { id, expiry: expiryTimeInSeconds } = JSON.parse(
   //    Buffer.from(payload, "base64url").toString(),
   // );

   // console.log({ expiryTimeInSeconds });

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

   // console.log({ expiryTimeInSeconds, currentTimeInSeconds });
   const user = await User.findOne({ _id: session.userId }).lean();

   if (!user) {
      return res.status(401).json({ error: "User Not Logged In" });
   }
   req.user = user;
   next();
}

export const checkNotRegularUser = (req, res, next) => {
   if (req.user.role != "User") return next();
   return res.status(403).json({ error: "Not Authorized Person" });
   
};

export const checkIsAdminUser = (req, res, next) => {
   if (req.user.role === "Admin") return next();
   return res.status(403).json({ error: "You can not delete users" });
};
