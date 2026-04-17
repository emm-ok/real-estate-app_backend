import express from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";
import {
  validateApplicationUpdate,
  validateDocumentType,
  validateUser,
} from "../../middlewares/agentApplication.middleware.js";
import {
  createAgentApplication,
  deleteAgentApplication,
  deleteAgentDocument,
  getMyAgentApplication,
  submitAgentApplication,
  updateAgentApplication,
  uploadAgentDocument,
  verifyApplicationDocument,
} from "./agent-application.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// Apply for Agent role
router.use(validateAuth); // middleware validateAuthentication

// Admin Actions
// router.get("/all-applications", requireAdmin, getAgentApplications);
// router.get("/:applicationId", requireAdmin, getAgentApplicationById);
router.patch("/doc/:docId", requireAdmin, verifyApplicationDocument);
// router.patch("/:applicationId", requireAdmin, approveAgentApplication);
// router.patch("/:applicationId", requireAdmin, rejectAgentApplication);

router.use(validateUser); // middleware (check req.user exist or status is ACTIVE)

router.post("/", createAgentApplication);
router.get("/", getMyAgentApplication);
router.use(validateApplicationUpdate); // middleware (validate user can update application)
router.put("/", updateAgentApplication);
router.post(
  "/doc/:type",
  validateDocumentType,
  (req, _, next) => {
    req.uploadContext = "agent-doc";
    next();
  },
  upload.single("file"),
  uploadAgentDocument,
);
router.delete("/doc/:type", deleteAgentDocument);
router.delete("/delete", deleteAgentApplication);
router.post("/submit", submitAgentApplication);

export default router;
