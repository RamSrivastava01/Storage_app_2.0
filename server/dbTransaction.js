import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb://localhost:27017/");
await client.connect();

console.log("Database connected");
const db = client.db();
const directories = db.collection("directories");
const users = db.collection("users");
try {
   const session = client.startSession();
   session.startTransaction();
   await directories.insertOne(
      {
         name: "db",
         userName: "ram srivastava",
      },
      { session },
   );

   await users.insertOne(
      {
         name: "r",
         rootDirName: "db",
      },
      { session },
   );

   await session.commitTransaction();

   await client.close();
} catch (error) {
   console.log(error.message, error.code);
}

console.log("database disconnected");
