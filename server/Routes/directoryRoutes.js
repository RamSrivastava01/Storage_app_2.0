import express from "express";
import { createWriteStream } from "fs";
import { rename, rm, stat, writeFile } from "fs/promises";
import cors from "cors";
import path, { dirname, join } from "path";

import crypto from "crypto";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import { Db, ObjectId } from "mongodb";

// Using multer library for file upload on to the server;
//This makes the task easy for making file upload;
const router = express.Router();
// console.log(router)

// >=====Getting data from directory=====<

router.param("id", validateIdMiddleware);
router.param("parentDirId", validateIdMiddleware);

router.get("/{:id}", async (req, res) => {
   const db = req.db;
   const dirCollection = db.collection("directories");
   const user = req.user;
   const id = String(req.params.id || user.rootDirId);
   const directoryObjectId = new ObjectId(id);

   const directoryData = await dirCollection.findOne({
      _id: directoryObjectId,
      userId: user._id,
   });

   if (!directoryData) {
      return res.status(404).json({
         error: "Directory not found or you do not have access to it!",
      });
   }

   const files = await db
      .collection("files")
      .find({ parentDirId: directoryData._id })
      .toArray();

   const directories = await dirCollection
      .find({
         parentDirId: { $in: [id, directoryObjectId] },
         userId: user._id,
      })
      .toArray();
   return res.status(200).json({
      ...directoryData,
      files: files.map((file) => ({ ...file, id: file._id })),
      directories: directories.map((dir) => ({ ...dir, id: dir._id })),
   });
});
//  >======== Creating Directory======<
router.post("/{:parentDirId}", async (req, res, next) => {
   const user = req.user;
   console.log(user);
   const db = req.db;
   const dirCollection = db.collection("directories");
   const userCollection = db.collection("users");
   const dbUser = await userCollection.findOne({ email: user.email });

   const parentDirId = req.params.parentDirId || dbUser.rootDirId.toString();
   console.log({ parentDirId });
   const dirname = req.headers.dirname || "New Folder";

   try {
      const parentDir = await dirCollection.findOne({
         _id: new ObjectId(String(parentDirId)),
      });

      if (!parentDir) {
         return res
            .status(404)
            .json({ message: "Parent Directory Does not exist!" });
      }

      const savedDir = await dirCollection.insertOne({
         name: dirname,
         parentDirId,
         userId: user._id,
      });

      console.log({ savedDir });
      return res.status(201).json({ message: "Directory Created!" });
   } catch (error) {
      console.log({ error });
   }
});

router.patch("/:id", async (req, res, next) => {
   const user = req.user;
   const { id } = req.params;
   const { newDirName } = req.body;
   const db = req.db;
   const dirCollection = db.collection("directories");

   try {
      const a = await dirCollection.updateOne(
         {
            _id: new ObjectId(id),
            userId: user._id,
         },
         { $set: { name: newDirName } },
      );
      console.log(a);
      res.status(200).json({ message: "Directory Renamed!" });
   } catch (err) {
      next(err);
   }
});

router.delete("/:id", async (req, res, next) => {
   const { id } = req.params;
   try {
      const dirIndex = directoriesData.findIndex(
         (directory) => directory.id === id,
      );
      const directoryData = directoriesData[dirIndex];
      directoriesData.splice(dirIndex, 1);
      for await (const fileId of directoryData.files) {
         const fileIndex = filesData.findIndex((file) => file.id === fileId);
         const fileData = filesData[fileIndex];
         await rm(`./storage/${fileId}${fileData.extension}`);
         filesData.splice(fileIndex, 1);
      }
      for await (const dirId of directoryData.directories) {
         const dirIndex = directoriesData.findIndex(({ id }) => id === dirId);
         directoriesData.splice(dirIndex, 1);
      }
      const parentDirData = directoriesData.find(
         (dirData) => dirData.id === directoryData.parentDirId,
      );
      parentDirData.directories = parentDirData.directories.filter(
         (dirId) => dirId !== id,
      );
      await writeFile("./filesDB.json", JSON.stringify(filesData));
      await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
      res.status(200).json({ message: "Directory Deleted!" });
   } catch (err) {
      next(err);
   }
});
export default router;
