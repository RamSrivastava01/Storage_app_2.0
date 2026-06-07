import express from "express";
import cors from "cors";
import crypto from 'crypto'
import directoriesData from '../directoriesDB.json' with {type: "json"}
import usersData from "../usersDB.json" with {type: "json"}
import { writeFile } from "fs/promises";




const router = express.Router();

//use cookie parser for parsing the request from the browser
// use command npm i cookie-


// File Post Route

router.post("/register", async (req, res, next) => {
   const { name, email, password } = req.body
   console.log(name)
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
      await writeFile('./directoriesDB.json', JSON.stringify(directoriesData))
      await writeFile('./usersDB.json', JSON.stringify(usersData))
      res.status(201).json({ message: `User created with ID ${userId}` })
   } catch (error) {
      next(error)
   }

})

router.post("/login", async (req, res) => {
   const { email, password } = req.body;
   const user = usersData.find((user) => user.email == email);
   if (!user || (user.password != password)) {
      return res.status(404).json({ error: "Invalid credentials" })
   }

   res.cookie("uid", user.id, {
      httpOnly: true,
      maxAge: 60 * 1000 * 60 * 24 * 7
   })


   res.json({ message: "logged in" })
})

export default router;
