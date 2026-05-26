import express from "express";
import { createWriteStream } from "fs";
import { rename, rm, stat, writeFile } from "fs/promises";
import cors from "cors";
import path, { dirname, join } from "path";
import directoriesData from '../directoryDB.json' with {type: "json"}
import filesData from '../filesDb.json' with {type: 'json'}
import crypto from "crypto";


// Using multer library for file upload on to the server;
//This makes the task easy for making file upload;

const router = express.Router();
// console.log(router)

// >=====Getting data from directory=====<
router.get("/{:id}", async (req, res) => {
   const { id } = req.params || directoriesData[0].id
   const directoryData = id ? directoriesData.find((directory) => directory.id === id) : directoriesData[0]
   if (!directoryData) {
      return res.status(404).json({ message: "Directory not Found" })
   }
   const files = directoryData.files.map((fileId) =>
      filesData.find((file) => file.id === fileId)
   )
   const directories = directoryData.directories.map((dirId) =>
      directoriesData.find((dir) => dir.id === dirId)
   ).map((({ id, name }) => ({ id, name })))
   res.json({ ...directoryData, files, directories })
});
//  >======== Creating Directory======<
router.post("/{:parentDirId}", async (req, res, next) => {
   const parentDirId = req.params.parentDirId || directoriesData[0].id
   const dirname = req.headers.dirname || "New Folder"
   const id = crypto.randomUUID()
   const parentDir = directoriesData.find((dir) => dir.id === parentDirId)
   if (!parentDir) res.status(404).json({ message: "Parent Folder does not exist " })
   parentDir.directories.push(id)
   directoriesData.push({
      id,
      name: dirname,
      parentDirId,
      files: [],
      directories: []
   })
   try {
      await writeFile('./directoryDB.json', JSON.stringify(directoriesData))
      res.json({ message: "Directory Created!" })
   } catch (err) {
      next(err);
      // res.status(404).json({ err: err.message });
   }
})


router.patch("/:id", async (req, res, next) => {
   const { id } = req.params
   const { newDirName } = req.body
   // console.log({ id, newDirName })
   //search for the directory;
   const directory = directoriesData.find((dir) => dir.id === id)
   if (!directory) return res.status(404).json({ message: "Folder not found to be renamed" })
   console.log("OldDir--->", directory)
   directory.name = newDirName;
   try {
      await writeFile('./directoryDB.json', JSON.stringify(directoriesData))
      return res.status(200).json({ message: "Folder renamed" })

   } catch (err) {
      next(err)
   }


})

router.delete("/:id", async (req, res, next) => {
   const { id } = req.params
   try {
      const dirIndex = directoriesData.findIndex((directory) => directory.id === id)
      const directoryData = directoriesData[dirIndex]
      directoriesData.splice(dirIndex, 1)
      for await (const fileId of directoryData.files) {
         const fileIndex = filesData.findIndex((file) => file.id === fileId)
         const fileData = filesData[fileIndex]
         await rm(`./storage/${fileId}${fileData.extension}`);
         filesData.splice(fileIndex, 1)
      }
      for await (const dirId of directoryData.directories) {
         const dirIndex = directoriesData.findIndex(({ id }) => id === dirId)
         directoriesData.splice(dirIndex, 1)
      }
      const parentDirData = directoriesData.find((dirData) => dirData.id === directoryData.parentDirId)
      parentDirData.directories = parentDirData.directories.filter((dirId) => dirId !== id)
      await writeFile('./filesDB.json', JSON.stringify(filesData))
      await writeFile('./directoryDB.json', JSON.stringify(directoriesData))
      return res.status(200).json({ message: "Directory Deleted!" });
   } catch (err) {
      console.log(err);
      next(err)
   }
});
export default router
