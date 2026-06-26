import { ObjectId } from "mongodb";

export default async function CheckAuth(req, res, next) {
   const db = req.db;

   const { uid } = req.cookies;

   if (!uid) {
      return res.status(401).json({ error: "User Not Logged In" });
   }

   const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(String(uid)) });
   if (!user) {
      return res.status(401).json({ error: "User Not Logged In" });
   }
   req.user = user;
   next();
}
