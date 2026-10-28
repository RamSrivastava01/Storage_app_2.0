import mongoose from "mongoose";

export async function connectDb() {
   try {
      await mongoose.connect(
         "mongodb://admin:helloworld@127.0.0.1:27017/storageApp?authSource=admin&replicaSet=myReplicaSet",
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
