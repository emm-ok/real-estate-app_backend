import express from "express";
import {
  forgotPassword,
  googleAuth,
  googleCallback,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail,
} from "./auth.controller.js";
import passport from "passport";
import { env } from "../../config/env.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);

router.post("/login", login);

router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get(
  "/google",
  googleAuth,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/sign-in`,
  }),
  googleCallback,
);

export default router;
