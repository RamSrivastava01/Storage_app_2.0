import { connectDb, client } from "./db.js";

try {
   const db = await connectDb();

   await db.command({
      collMod: "users",
      validator: {
         $jsonSchema: {
            required: ["_id", "name", "email", "password", "rootDirId"],
            properties: {
               _id: {
                  bsonType: "objectId",
               },
               name: {
                  bsonType: "string",
                  minLength: 2,
               },
               password: {
                  bsonType: "string",
                  minLength: 4,
               },
               email: {
                  bsonType: "string",
                  pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
               },
               rootDirId: {
                  bsonType: "objectId",
               },
            },
            additionalProperties: false,
         },
      },
      validationAction: "error",
      validationLevel: "strict",
   });

   await db.command({
      collMod: "directories",
      validator: {
         $jsonSchema: {
            required: ["_id", "name", "parentDirId", "userId"],
            properties: {
               _id: {
                  bsonType: "objectId",
               },
               name: {
                  bsonType: "string",
                  minLength: 2,
               },
               parentDirId: {
                  bsonType: ["objectId", "null"],
               },
               userId: {
                  bsonType: "objectId",
               },
            },
            additionalProperties: false,
         },
         validationAction: "error",
         validationLevel: "strict",
      },
   });

   await db.command({
      collMod: "files",
      validator: {
         $jsonSchema: {
            required: ["_id", "name", "extension", "userId", "parentDirId"],
            properties: {
               name: {
                  bsonType: "string",
                  description: "must be a string and is required",
               },
               _id: {
                  bsonType: "objectId",
                  description: "Id must be type of Object Id",
               },
               extension: {
                  bsonType: "string",
                  description: "must be a string and is required",
                  pattern: "^\\.[a-zA-Z0-9]+$",
               },
               userId: {
                  bsonType: "objectId",
                  description: "must be an ObjectId and is required",
               },
               parentDirId: {
                  bsonType: "objectId",
                  description: "must be an ObjectId and is required",
               },
            },
            additionalProperties: false,
         },
         validationAction: "error",
         validationLevel: "strict",
      },
   });
} catch (error) {
   console.log("error setting up the Database");
} finally {
   client.close();
}
