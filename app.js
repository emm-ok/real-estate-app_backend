import express from "express";
import { env } from "./config/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
// import { connectToDB } from "./config/db.js";
import passport from "passport";

import "./config/passport.js";
import { prisma } from "./lib/prisma.js";
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/user/user.route.js";
import agentApplicationRoutes from "./modules/agent-application/agent-application.route.js";
import companyApplicationRoutes from "./modules/company-application/company-application.route.js";
import listingRoutes from "./modules/listing-application/listing-application.route.js";
import agentRoutes from "./modules/agent/agent.route.js";

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
app.use(passport.initialize());

// APP API Routes
app.get("/", async(req, res) => {
    const user = await prisma.user.findMany();
    return res.json(user)
})

app.use(`${API_URL}/auth`, authRoutes);
app.use(`${API_URL}/user`, userRoutes);
app.use(`${API_URL}/agent-application`, agentApplicationRoutes);
app.use(`${API_URL}/company-application`, companyApplicationRoutes);
app.use(`${API_URL}/listing`, listingRoutes);
app.use(`${API_URL}/agent`, agentRoutes);


// connectToDB();
app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
})