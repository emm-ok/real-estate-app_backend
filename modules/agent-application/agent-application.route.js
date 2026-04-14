import express from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Apply for Agent role
router.post("/", createAgentApplication);
router.get("/", fetchAgentApplication);
router.put("/", updateAgentApplication);
router.delete("/", deleteAgentApplication);

export default router;