import mongoose from "mongoose";

await mongoose.connect(
   "mongodb://admin:helloworld@127.0.0.1:27017/storageApp?authSource=admin&replicaSet=myReplicaSet",
);
