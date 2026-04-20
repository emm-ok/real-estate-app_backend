import { Router } from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";
import { validateUser } from "../../middlewares/agentApplication.middleware.js";
import { requireAdmin, requireAgent } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(validateAuth, validateUser, requireAgent);

router.put("/", updateAgentDetails)
router.get("/stats", getAgentStats)

router.use(requireAdmin);
router.get("/all-agents", getAllAgents);
router.get("/:agentId", getAgent);
router.patch("/:agentId", updateAgentStatus);

export default router;