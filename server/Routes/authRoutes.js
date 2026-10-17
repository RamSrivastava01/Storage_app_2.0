import express from "express";

import {
   loginWithGoogle,
   sendOtpController,
   verifyOtpController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/send-otp", sendOtpController);

router.post("/verify-otp", verifyOtpController);

router.post("/google", loginWithGoogle);

export default router;
 