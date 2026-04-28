import express from "express";
import { validateAuth } from "../../middlewares/auth.middleware.js";
import { validateListing, validateUser } from "../../middlewares/agentApplication.middleware.js";
import { requireAgent } from "../../middlewares/role.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { createListing, deleteListing, deleteListingMedia, deleteListingMedias, getAllListings, getListing, updateListing, uploadListing, uploadListingMedia } from "./listing-application.controller.js";


const router = express.Router();

// router.use(
//     // validateAuth, 
//     // validateUser, 
//     // requireAgent
// );


router.post("/", createListing);
router.get("/all-listings", getAllListings);
router.get("/", getListing);

router.use(validateListing) // middleware
router.put("/:listingId", updateListing);
router.post(
  "/:listingId/media",
  (req, _, next) => {
    req.uploadContext = "listing-media";
    next();
  },
  upload.array("files", 10),
  uploadListingMedia,
);
router.delete("/:listingId/media/:mediaId", deleteListingMedia);
router.delete("/:listingId/media", deleteListingMedias);
router.delete("/:listingId/delete", deleteListing);
router.post("/:listingId/submit", uploadListing);

export default router;
