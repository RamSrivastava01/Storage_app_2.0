import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://127.0.0.1:27017/storageApp");

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
