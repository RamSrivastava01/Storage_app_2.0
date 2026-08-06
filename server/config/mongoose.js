import mongoose from "mongoose";

await mongoose.connect(
   "mongodb://ram:ram@localhost:27017/storageApp?replicaSet=myReplicaSet",
);
