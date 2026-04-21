import { Router } from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";
import { validateUser } from "../../middlewares/agentApplication.middleware.js";
import {
  requireCompanyAdmin,
  requireCompanyMember,
} from "../../middlewares/role.middleware.js";
import { getAllCompanies, getCompanyAgents, getCompanyById, getCompanyListings, getMyCompanies, updateCompany, updateCompanyLogo, updateCompanyStatus } from "./company.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.use(validateAuth, validateUser);

router.get("/all-companies", getAllCompanies); // get all companies in database
router.get("/", getMyCompanies); // get user companies
router.get("/:companyId", getCompanyById); // get 1 company by ID
router.patch("/:companyId/status", requireCompanyAdmin, updateCompany);
router.get("/:companyId/agents", getCompanyAgents);
router.post(
  "/:companyId",
  (req, _, next) => {
    req.uploadContext = "company-doc";
    next();
  },
  upload.single("file"),
  updateCompanyLogo,
);

// router.get("/:companyId/stats", getCompanyStats);
router.get("/:companyId/listings", getCompanyListings);

// Admin Actions
router.patch("/:companyId/status", updateCompanyStatus);

export default router;
