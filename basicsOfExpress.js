import express from 'express'
import { appendFile, createWriteStream, writeFile } from 'node:fs'


const app = express()
// app.get("/", (req, res, next) => {
//    console.log("Running middleware 1")
//    next()
//    res.end("hello world 1 \n")
// }, (req, res, next) => {
//    console.log("Running middleware 2")
//    res.write("hello world 2 \n")

// }, (err, req, res, next) => { //Error handle middleware
//    console.log("Running middleware 2")
//    res.write("hello world 2 \n")

// })

app.use(express.json())
app.use(express.static("test"))

// app.use((req, res, next) => {
//    console.log(req.url)
//    console.log(req.headers.host)
//    res.write(`request on ${req.method} method \n`)
//    next()
// })

// app.use("/", (req, res, next) => {
//    res.end("use Middleware")
//    next()
// })


app.use("/admin", (req, res, next) => {
   if (req.body.password === "secret") {
      next()
   } else {
      res.end("Invalid credentials")
   }
})


app.get("/", (req, res) => {

   // res.sendFile(`${import.meta.dirname}/test/video.mp4`)
   // res.setHeader("content-type", "application/json") --> These two methods are outdatedd 
   // res.end(JSON.stringify({ message: "hello worl " }))

   res.status(201).json({ message: " Upload successful" })


})

app.get("/login", (req, res) => {
   res.end("Login GET")
})

app.post("/admin", (req, res) => {
   res.end("Hello Admin")
})

app.post("/", (req, res) => {
   res.end("Post route Home")
})

app.delete("/delete", (req, res) => {

   const obj = {
      message: "Data deleted !!",
      date: Date.now().toLocaleString()
   }
   res.end(JSON.stringify(obj))
})


app.listen(8080, () => {
   console.log("server is up....")
})