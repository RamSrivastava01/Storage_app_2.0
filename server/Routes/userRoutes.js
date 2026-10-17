import express from "express";
import cors from "cors";
import CheckAuth from "../middlewares/auth.js";
import {
   getAllUser,
   getUser,
   userLogin,
   userLogout,
   userLogoutAll,
   userRegister,
} from "../controllers/userControllers.js";

const router = express.Router();

//use cookie parser for parsing the request from the browser
// use command npm i cookie-

router.post("/user/register", userRegister);

router.post("/user/login", userLogin);
router.get("/user", CheckAuth, getUser);
router.get(
   "/users",
   CheckAuth,
   (req, res, next) => {
      if (req.user.role != "User") return next();
      return res.status(403).json({ error: "Not Authorized Person" });
      console.log(req.user);
   },
   getAllUser,
);

router.post("/user/logout", userLogout);
router.post("/user/logout-all", userLogoutAll);

export default router;
