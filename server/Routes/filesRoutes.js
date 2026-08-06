import express from "express";
import { createWriteStream } from "fs";
import { mkdir, readdir, rename, rm, stat, writeFile } from "fs/promises";
import cors from "cors";
import path, { dirname, join } from "path";

import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import { Db, ObjectId } from "mongodb";
import {
   deleteFile,
   getFile,
   renameFile,
   uploadFile,
} from "../controllers/fileControllers.js";

export const router = express.Router();
// File Post Route
router.post("/{:parentDirId}", uploadFile);

//File Get Route

router.param("id", validateIdMiddleware);
router.param("parentDirId", validateIdMiddleware);

router.get("/:id", getFile);

// File Patch Route

router.patch("/:id", renameFile);

// File Delete Route

router.delete("/:id", deleteFile);

export default router;
