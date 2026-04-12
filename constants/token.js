import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import cookies from "cookie-parser"

export const generateToken = (userId, res) => {
    const payload = { id: userId};
    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return token;
}