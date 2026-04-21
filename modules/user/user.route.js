import express from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";
import {
  deleteUser,
  fetchUser,
  updateUser,
  updateUserImage,
} from "./user.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { validateUser } from "../../middlewares/agentApplication.middleware.js";

const router = express.Router();

// Auth Middleware for validating user id and token
router.use(validateAuth, validateUser);

// Authenticated User Actions
router.get("/", fetchUser);

router.put("/", updateUser);
router.post(
  "/",
  (req, _, next) => {
    req.uploadContext = "user-avatar";
    next();
  },
  upload.single("image"),
  updateUserImage,
);
router.delete("/", deleteUser);

export default router;
