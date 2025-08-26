import express from "express";
import { signIn, logout, signUp } from "../controllers/auth.controller.js";
import { sendOtpForReset, verifyOtpAndResetPassword } from "../controllers/forgotPassword.controller.js";
import { signInValidation, signUpValidation, validate, sanitizeInput } from "../middlewares/validation.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const authRouter = express.Router();

// Authentication routes with validation and rate limiting
authRouter.post("/signin", authLimiter, sanitizeInput, signInValidation, validate, signIn);
authRouter.post("/signup", authLimiter, sanitizeInput, signUpValidation, validate, signUp);
authRouter.get("/logout", logout);

// Password reset routes
authRouter.post("/forgot-password/send-otp", sendOtpForReset);
authRouter.post("/forgot-password/verify-otp", verifyOtpAndResetPassword);

export default authRouter;
