import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith("image");
    const isVideo = file.mimetype.startsWith("video");
    const isDocument =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" || // .doc
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; // .docx

    // distribute to specific folder
    let folder;

    switch (req.uploadContext) {
      case "agent-doc":
        folder = "agent-applications/documents";
        break;
      case "company-doc":
        folder = "company-applications/documents";
        break;
      case "listing-media":
        folder = "listings/media";
        break;
      case "user-avatar":
        folder = "users/avatars";
        break;
    }

    return {
      folder,
      resource_type: isImage || isVideo ? "auto" : "raw",

      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "mp4",
        "mov",
        "webm",
        "pdf",
        "doc",
        "docx",
      ],

      transformation: isImage
        ? [{ quality: "auto", fetch_format: "auto" }]
        : undefined,
    };
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});
