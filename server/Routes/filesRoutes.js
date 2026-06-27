import express from "express";
import { createWriteStream } from "fs";
import { mkdir, readdir, rename, rm, stat, writeFile } from "fs/promises";
import cors from "cors";
import path, { dirname, join } from "path";

import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import { Db, ObjectId } from "mongodb";

const router = express.Router();
// File Post Route
router.post("/{:parentDirId}", async (req, res) => {
   const db = req.db;
   const dirCollection = db.collection("directories");
   const filesCollection = db.collection("files");
   const parentDirId = req.params.parentDirId || req.user.rootDirId;
   const parentDirData = await dirCollection.findOne({
      _id: new ObjectId(parentDirId),
   });
   console.log(parentDirData);
   if (!parentDirData) {
      return res
         .status(401)
         .json({ message: "No parent folder found in the database" });
   }

   const filename = req.headers.filename || "untitled";

   const extension = path.extname(filename);

   const insertedFile = await db.collection("files").insertOne({
      extension,
      name: filename,
      parentDirId: parentDirData._id,
      userId: req.user._id,
   });
   const fileId = insertedFile.insertedId.toString();
   const fullFileName = `${fileId}${extension}`;
   const writeStream = createWriteStream(`./storage/${fullFileName}`);
   req.pipe(writeStream);
   req.on("end", async () => {
      try {
         return res.status(201).json({ message: "File Uploaded" });
      } catch (error) {
         // if we do next here then the error is catched by the global middleware.
         // Global middleware catches all the request sent by any route. if next() is called
         res.status(404).json({
            message: "Something went wrong while creating the File",
         });
      }
   });

   req.on("error", async () => {
      await filesCollection.deleteOne({ _id: insertedFile.insertedId });
      return res.status(404).json({
         message: "File upload failed",
      });
   });
});

//File Get Route

router.param("id", validateIdMiddleware);
router.param("parentDirId", validateIdMiddleware);

router.get("/:id", async (req, res) => {
   const db = req.db;
   const { id } = req.params;
   const fileCollection = db.collection("files");
   const fileData = await fileCollection.findOne({
      _id: new ObjectId(id),
      userId: req.user._id,
   });

   if (!fileData) {
      return res.status(404).json({ message: `${id} does not exist` });
   }

   const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

   if (req.query.action === "download") {
      // res.set("Content-Disposition", `attachment; filename=${fileData.name}`);
      return res.download(filePath, fileData.name);
   }
   res.sendFile(filePath, (err) => {
      // console.log(err);
      if (!res.headersSent && err) {
         return res.status(404).json({ error: "File not found!" });
      }
   });
});

// File Patch Route

router.patch("/:id", async (req, res) => {
   const { id } = req.params;
   const db = req.db;
   const fileCollection = db.collection("files");
   const fileData = await fileCollection.findOne({
      _id: new ObjectId(id),
      userId: req.user._id,
   });
   if (!fileData) {
      return res.status(404).json({ message: "File not available to Edit" });
   }

   try {
      await fileCollection.updateOne(
         { _id: new ObjectId(id) },
         { $set: { name: req.body.newFilename } },
      );
      return res.status(200).json({
         message: "File rename successful",
      });
   } catch (error) {
      console.log({ error });
      return res.status(404).json({
         message: "Something went wrong while Renaming",
      });
   }
});

// File Delete Route

router.delete("/:id", async (req, res) => {
   const { id } = req.params;
   const db = req.db;
   const fileCollection = db.collection("files");
   const fileData = await fileCollection.findOne({
      _id: new ObjectId(id),
      userId: req.user._id,
   });

   if (!fileData) {
      return res.status(404).json({ message: "File not available to delete" });
   }
   try {
      await rm(`./storage/${id}${fileData.extension}`);
      await fileCollection.deleteOne({ _id: fileData._id });

      return res.json({ message: "File Deleted Successfully" });
   } catch (err) {
      console.error(err);

      return res.status(404).json({
         message: "File Not Found",
      });
   }
});

export default router;
