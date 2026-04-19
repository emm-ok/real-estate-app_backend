import express from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";
import { validateCompanyApplicationUpdate, validateCompanyDocumentType, validateUser } from "../../middlewares/agentApplication.middleware.js";

const router = express.Router();

router.use(validateAuth); // middleware validateAuthentication
router.use(validateUser); // middleware (check req.user exist or status is ACTIVE)

router.get("/all-applications", requireAdmin, getCompanyApplications);
router.get("/:applicationId", requireAdmin, getCompanyApplicationById);
router.patch("/doc/:docId", requireAdmin, verifyApplicationDocument);
router.patch("/:applicationId/approve", requireAdmin, approveCompanyApplication);
router.patch("/:applicationId/reject", requireAdmin, rejectCompanyApplication);


router.post("/", createCompanyApplication);
router.get("/", getMyCompanyApplication);

router.use(validateCompanyApplicationUpdate); // middleware (validate user can update application)
router.put("/", updateCompanyApplication);
router.post(
  "/doc/:type",
  validateCompanyDocumentType, // middleware - ensure only valid document types like (id_card) is allowed
  (req, _, next) => {
    req.uploadContext = "company-doc"; // middleware - handles which folder file will be stored in cloudinary
    next();
  },
  upload.single("file"), // middleware - handles file upload using multer to parse file
  uploadCompanyDocument
);
router.delete("/doc/:type", deleteCompanyDocument);
router.delete("/delete", deleteCompanyApplication);
router.post("/submit", submitCompanyApplication)

export default router;