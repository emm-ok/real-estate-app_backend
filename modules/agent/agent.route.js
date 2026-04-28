import { Router } from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";
import { validateUser } from "../../middlewares/agentApplication.middleware.js";
import { requireAdmin, requireAgent } from "../../middlewares/role.middleware.js";
import { getAgent, getAgentStats, getAllAgents, updateAgentStatus } from "./agent.controller.js";

const router = Router();

router.use(
    validateAuth, 
    validateUser, 
);
// router.put("/", updateAgentDetails)
router.get("/stats", requireAgent, getAgentStats);

router.use(requireAdmin);
router.get("/all-agents", getAllAgents);
router.get("/:agentId", getAgent);
router.patch("/:agentId/status", updateAgentStatus);

export default router;