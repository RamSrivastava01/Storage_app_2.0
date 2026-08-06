import express from "express";
import { createWriteStream } from "fs";
import { rename, rm, stat, writeFile } from "fs/promises";
import cors from "cors";
import path, { dirname, join } from "path";

import crypto from "crypto";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import { Db, ObjectId } from "mongodb";
import {
   createDirectory,
   deleteDirectory,
   getDirectorById,
   renameDirectory,
} from "../controllers/directoryControllers.js";

// Using multer library for file upload on to the server;
//This makes the task easy for making file upload;
const router = express.Router();
// console.log(router)

// >=====Getting data from directory=====<

router.param("id", validateIdMiddleware);
router.param("parentDirId", validateIdMiddleware);

router.get("/{:id}", getDirectorById);
//  >======== Creating Directory======<
router.post("/{:parentDirId}", createDirectory);

router.patch("/:id", renameDirectory);

router.delete("/:id", deleteDirectory);
export default router;
