import express from "express";
import { env } from "./config/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
// import { connectToDB } from "./config/db.js";
import authRoutes from "./modules/auth/auth.route.js";
import { prisma } from "./lib/prisma.js";

console.log("PORT:", env.PORT);
const app = express();

const API_URL = `/api/real-estate/v1`;
// middlewares
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// APP API Routes
app.get("/", async(req, res) => {
    const user = await prisma.user.findMany();
    return res.json(user)
})
app.delete("/", async(req, res) => {
    const user = await prisma.user.delete({
        where: { email: "davenick@gmail.com"}
    });
    return res.json(user)
})
app.use(`${API_URL}/auth`, authRoutes)


// connectToDB();
app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
})