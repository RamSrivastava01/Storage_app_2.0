import express from "express";

import CheckAuth, {
   checkIsAdminUser,
   checkNotRegularUser,
} from "../middlewares/auth.js";
import {
   deleteUserByAdmin,
   getAllUser,
   getUser,
   logoutById,
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
router.get("/users", CheckAuth, checkNotRegularUser, getAllUser);

router.post(
   "/users/:userId/logout",
   CheckAuth,
   checkNotRegularUser,
   logoutById,
);

router.post("/user/logout", userLogout);
router.post("/user/logout-all", userLogoutAll);

router.delete("/users/:userId", CheckAuth, checkIsAdminUser, deleteUserByAdmin);

export default router;
