


import express from "express"; 
import { askToAssistant, getCurrentUser, updateAssistant } from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
import { upload, handleMulterError } from "../middlewares/multer.js";
import { updateAssistantValidation, askAssistantValidation, validate, sanitizeInput } from "../middlewares/validation.js";
import { aiLimiter, uploadLimiter } from "../middlewares/rateLimit.js";

const userRouter = express.Router();

// Get current user
userRouter.get("/current", isAuth, getCurrentUser);

// Update assistant (with file upload)
userRouter.post("/update", isAuth, uploadLimiter, upload.single("assistantImage"), handleMulterError, sanitizeInput, updateAssistantValidation, validate, updateAssistant);

// Ask assistant
userRouter.post("/asktoassistant", isAuth, aiLimiter, sanitizeInput, askAssistantValidation, validate, askToAssistant);

export default userRouter;





