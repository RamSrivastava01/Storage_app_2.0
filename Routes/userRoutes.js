import express from "express";
import cors from "cors";
import crypto from 'crypto'
import directoriesData from '../directoryDB.json' with {type: "json"}
import usersData from "../usersDB.json" with {type: "json"}
import { writeFile } from "fs/promises";



const router = express.Router();

// File Post Route

router.post("/", async (req, res) => {
   const { name, email, password } = req.body

   const foundUser = usersData.find((user) => user.email == email)

   if (foundUser) {
      return res.status(409).json({ error: "User already exists" })
   }

   const dirId = crypto.randomUUID();
   const userId = crypto.randomUUID();
   directoriesData.push({
      id: dirId,
      name: `root-${email}`,
      userId,
      parentDirId: null,
      files: [],
      directories: []

   })
   usersData.push({
      id: userId, name, email, password,
      rootDirId: dirId
   })

   try {
      await writeFile('./directoryDB.json', JSON.stringify(directoriesData))
      await writeFile('./usersDB.json', JSON.stringify(usersData))
      res.status(201).json({ message: `User created with ID ${userId}` })
   } catch (error) {

   }

})

export default router;