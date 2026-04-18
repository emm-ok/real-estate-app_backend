import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export const validateAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.jwt) {
      token = req.cookies?.jwt;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated - no token provided",
      });
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    // console.log("Decoded", decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    // console.log("user from midddlewware", user);

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
