import express from "express";
import { createWriteStream } from "fs";
import { mkdir, readdir, rename, rm, stat, writeFile } from "fs/promises";
import cors from "cors";
import path, { dirname, join } from "path";
import crypto from 'crypto'
import filesData from '../filesDb.json' with {type: 'json'}
import directoriesData from '../directoryDB.json' with {type: "json"}



const router = express.Router();
// File Post Route
router.post("/{:parentDirId}", (req, res) => {
   const parentDirId = req.params.parentDirId || directoriesData[0].id
   const filename = req.headers.filename || "untitled"
   const id = crypto.randomUUID();
   const extension = path.extname(filename);
   const fullFileName = `${id}${extension}`;
   const writeStream = createWriteStream(`./storage/${fullFileName}`);
   req.pipe(writeStream);
   req.on("end", async () => {
      filesData.push({
         id,
         extension,
         name: filename,
         parentDirId,
      })
      const parentDirData = directoriesData.find((directoryData) => directoryData.id === parentDirId)
      parentDirData.files.push(id)
      try {
         await writeFile('./filesDB.json', JSON.stringify(filesData))
         await writeFile('./directoryDB.json', JSON.stringify(directoriesData))
         return res.status(201).json({ message: "File Uploaded" });
      } catch (error) {
         // if we do next here then the error is catched by the global middleware. 
         // Global middleware catches all the request sent by any route. if next() is called
         res.status(404).json({ message: "Something went wrong while creating the File" })
      }
   });
});

//File Get Route

router.get("/:id", (req, res) => {
   console.log(req.url)
   const { id } = req.params
   const fileData = filesData.find((file) => file.id === id)

   if (!fileData) {
      return res.status(404).json({ message: `${id} does not exist` })
   }

   if (req.query.action === "download") {
      res.set("Content-Disposition", `attachment; filename=${fileData.name}`);
   }
   res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`, (err) => {
      // console.log(err);
      if (!res.headersSent && err) {
         return res.status(404).json({ error: "File not found!" });
      }
   });
});

// File Patch Route

router.patch("/:id", async (req, res) => {



   const { id } = req.params;
   console.log({ body: req.body })
   const fileData = filesData.find((file) => file.id === id)
   fileData.name = req.body.newFilename;
   try {
      await writeFile("./filesDB.json", JSON.stringify(filesData))
      return res.json({
         message: "Renamed Successfully",
      });

   } catch (err) {

      console.error(err);

      return res.status(500).json({
         message: "Rename Failed",
      });
   }
});

// File Delete Route

router.delete("/:id", async (req, res) => {

   const { id } = req.params;
   const fileIndex = filesData.findIndex((file) => file.id === id)
   if (fileIndex == -1) {
      return res.status(404).json({ message: "File is not available" })
   }
   const fileData = filesData[fileIndex]

   try {
      await rm(`./storage/${id}${fileData.extension}`, { recursive: true });
      filesData.splice(fileIndex, 1)
      const parentDirData = directoriesData.find((directoryData) => directoryData.id === fileData.parentDirId)

      parentDirData.files = parentDirData.files.filter((fileId) => fileId != id)

      await writeFile("./filesDB.json", JSON.stringify(filesData))
      await writeFile("./directoryDB.json", JSON.stringify(directoriesData))

      return res.json({
         message: "File Deleted Successfully",
      });

   } catch (err) {

      console.error(err);

      return res.status(404).json({
         message: "File Not Found",
      });
   }
});

export default router
