import mongoose from "mongoose";
import { MongoClient } from "mongodb";

export const client = new MongoClient(
   "mongodb://ram:ram@localhost:27017/storageApp?replicaSet=myReplicaSet",
);

export async function connectDb() {
   try {
      await mongoose.connect(
         "mongodb://ram:ram@localhost:27017/storageApp?replicaSet=myReplicaSet",
      );
      console.log("DB connection successful");
   } catch (error) {
      console.log(error);
      console.log("Could not connect to the database");
      process.exit(1);
   }
}

process.on("SIGINT", async () => {
   await mongoose.disconnect();
   console.log("Database disconnected Successfully");
   process.exit(0);
});
