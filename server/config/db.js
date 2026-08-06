import { MongoClient } from "mongodb";

export const client = new MongoClient(
   "mongodb://ram:ram@localhost:27017/storageApp?replicaSet=myReplicaSet",
);

export async function connectDb() {
   await client.connect();
   console.log("Database connected successfully");
   const db = client.db();
   return db;
}

process.on("SIGINT", async () => {
   await client.close();
   console.log("Database disconnected Successfully");
   process.exit(0);
});
