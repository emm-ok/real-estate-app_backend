import express from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";
import { deleteUser, fetchUser, updateUser } from "./user.controller.js";

const router = express.Router();

// Auth Middleware for validating user id and token
router.use(validateAuth);

// Authenticated User Actions
router.get("/", fetchUser); 

router.put("/", updateUser)

router.delete("/", deleteUser)

export default router;