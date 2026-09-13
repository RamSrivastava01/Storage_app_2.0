import express from "express";
import cors from "cors";
import CheckAuth from "../middlewares/auth.js";
import {
   getUser,
   userLogin,
   userLogout,
   userLogoutAll,
   userRegister,
} from "../controllers/userControllers.js";

const router = express.Router();

//use cookie parser for parsing the request from the browser
// use command npm i cookie-

// File Post Route

router.post("/register", userRegister);

// GET user route

router.get("/", CheckAuth, getUser);

router.post("/login", userLogin);

router.post("/logout", userLogout);
router.post("/logout-all", userLogoutAll);

export default router;
