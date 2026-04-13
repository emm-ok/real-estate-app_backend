import express from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Apply for Agent role
router.post("/agent-application", agentApplication);
router.get("/agent-application", agentApplication);
router.put("/agent-application", agentApplication);
router.delete("/agent-application", agentApplication);

export default router;