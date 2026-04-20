import cloudinary from "../../config/cloudinary.js";
import { prisma } from "../../lib/prisma.js";
import { companyStepSchemas } from "../../lib/validation.js";
import {
  checkIfComplete,
  checkUploadComplete,
  generateIp,
} from "../../utils/checkCompletion.js";
import crypto from "crypto";

export const createCompanyApplication = async (req, res) => {
  try {
    const existingApplication = await prisma.companyApplication.findFirst({
      where: { userId: req.user.id },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You already have an active company application",
      });
    }
    const ip = generateIp(req);
    await prisma.companyApplication.create({
      data: {
        userId: req.user.id,
        status: "DRAFT",
        currentStep: 0,
        verification: {
          create: {
            ipHash: crypto.createHash("sha256").update(ip).digest("hex") || "",
            userAgent: req.headers["user-agent"],
            riskScore: 0,
          },
        },
        history: {
          create: [
            {
              action: "CREATED",
              performedById: req.user.id,
              note: "Company Application created",
            },
          ],
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Company Application created successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to create company application",
    });
  }
};

export const getMyCompanyApplication = async (req, res) => {
  try {
    const existingApplication = await prisma.companyApplication.findFirst({
      where: {
        userId: req.user.id,
        status: { not: "APPROVED" },
      },
      include: {
        companyInfo: true,
        documents: true,
        adminReviews: true,
        history: true,
      },
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company Application retrieved successfully",
      application: existingApplication,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to fetch company application",
    });
  }
};

export const updateCompanyApplication = async (req, res) => {
  try {
    const { step } = req.body;
    const { application } = req;
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (step > application.currentStep + 1) {
      return res.status(400).json({
        message: "Invalid step progression",
      });
    }

    const schema = companyStepSchemas[step];
    if (!schema) {
      return res.status(400).json({ message: "Invalid step" });
    }

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.format(),
      });
    }

    const data = parsed.data;

    let updateData = {};

    if (step === 1) {
      updateData.companyInfo = {
        upsert: {
          create: data.companyInfo,
          update: data.companyInfo,
        },
      };
    }

    if (step === 2) {
      const isComplete = await checkUploadComplete(application, res);
      if (!isComplete) {
        return res.status(400).json({
          message: "Please upload all required documents before submission",
        });
      }
    }

    updateData.currentStep = Math.max(application.currentStep, step);

    const updated = await prisma.companyApplication.update({
      where: { id: application.id },
      data: {
        ...updateData,

        history: {
          create: {
            action: "UPDATED",
            performedById: req.user.id,
            note: `Updated step ${step}`,
          },
        },
      },
      include: {
        companyInfo: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Step ${step} saved successfully`,
      application: updated,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to update application",
    });
  }
};

export const uploadCompanyDocument = async (req, res) => {
  try {
    const { application } = req;
    const { type } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const document = await prisma.companyDocument.upsert({
      where: {
        companyApplicationId_type: {
          companyApplicationId: application.id,
          type,
        },
      },
      update: {
        url: req.file.path,
        publicId: req.file.filename,
        isVerified: false,
      },
      create: {
        companyApplicationId: application.id,
        type,
        url: req.file.path,
        publicId: req.file.filename,
        isVerified: false,
      },
    });

    await prisma.companyApplication.update({
      where: { id: application.id },
      data: {
        currentStep: Math.max(application.currentStep, 2), // Ensure user can't skip to step 3 without uploading document
      },
    });

    await prisma.companyApplicationHistory.create({
      data: {
        companyApplicationId: application.id,
        action: "DOCUMENT_UPLOADED",
        performedById: req.user.id,
        note: `Uploaded ${type}`,
      },
    });

    return res.status(201).json({
      success: true,
      message: `${type} uploaded successfully`,
      document,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Upload failed",
    });
  }
};

export const deleteCompanyDocument = async (req, res) => {
  try {
    const { application } = req;
    const { type } = req.params;

    const existing = await prisma.companyDocument.findUnique({
      where: {
        companyApplicationId_type: {
          companyApplicationId: application.id,
          type,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Document not found",
      });
    }
    const result = await cloudinary.uploader.destroy(existing.publicId, {
      resource_type: "raw",
    });

    if (result !== "ok" || result !== "not found") {
      throw new Error("Cloudinary deletion failed");
    }

    await prisma.companyDocument.delete({
      where: {
        companyApplicationId_type: {
          companyApplicationId: application.id,
          type,
        },
      },
    });

    await prisma.companyApplicationHistory.create({
      data: {
        companyApplicationId: application.id,
        action: "DOCUMENT_DELETED",
        performedById: req.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${type} deleted succesfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to delete document`,
    });
  }
};

export const deleteCompanyApplication = async (req, res) => {
  try {
    const { application } = req;

    await prisma.$transaction([
      prisma.companyApplicationHistory.create({
        data: {
          companyApplicationId: application.id,
          action: "DELETE_APPLICATION",
          performedById: req.user.id,
        },
      }),
      prisma.companyApplication.delete({
        where: { id: application.id },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete company application",
    });
  }
};

export const submitCompanyApplication = async (req, res) => {
  try {
    const { application } = req;

    console.log("Application Point", application);
    // const user = await prisma.user.findUnique({
    //   where: { id: application.userId },
    // });

    // if(!user.emailVerified){
    //   return res.status(400).json({
    //     message: "Please verify your email before submitting the application",
    //   });
    // }

    if (application.currentStep < 3) {
      return res.status(400).json({
        message: "Please complete all steps before submission",
      });
    }

    if (application.status === "PENDING") {
      return res.status(400).json({
        message: "Application already submitted",
      });
    }

    if (!application.companyInfo) {
      return res.status(400).json({
        message: "Company information is required",
      });
    }

    const isComplete = await checkUploadComplete(application, res);
    if (!isComplete) {
      return res.status(400).json({
        message: "Please upload all required documents before submission",
      });
    }
    console.log("All documents uploaded, ready for submission");

    const updated = await prisma.companyApplication.update({
      where: { id: application.id },
      data: {
        status: "PENDING",
        submittedAt: new Date(),
        history: {
          create: {
            action: "SUBMITTED",
            performedById: req.user.id,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to submit company application",
    });
  }
};

// Admin Actions

export const getCompanyApplications = async (req, res) => {
  try {
    const applications = await prisma.companyApplication.findMany({
      where: { status: { not: "DRAFT" } },
    });

    if (applications.length < 1) {
      return res.status(404).json({
        message: "No applications found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      applications,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to fetch company applications",
    });
  }
};

export const getCompanyApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(404).json({
        message: "Application ID is required",
      });
    }

    const application = await prisma.companyApplication.findUnique({
      where: { id: applicationId },
      include: {
        companyInfo: true,
        documents: true,
        adminReviews: true,
        verification: true,
        history: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    await prisma.companyApplication.update({
      where: { id: application.id },
      data: {
        reviewedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Application fetched successfully",
      application,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to fetch company application",
    });
  }
};

export const verifyApplicationDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    // TODO: check if user email is verifed before verifying document

    if (!docId) {
      return res.status(400).json({
        message: "Document Id is required",
      });
    }
    const document = await prisma.companyDocument.update({
      where: { id: docId },
      data: { isVerified: true },
    });

    const application = await prisma.companyApplication.findUnique({
      where: { id: document.companyApplicationId },
    });

    await prisma.companyApplicationHistory.create({
      data: {
        applicationId: document.applicationId,
        action: "DOCUMENT_VERIFIED",
        performedById: req.user.id,
        note: `Verified ${document.type}`,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        entityType: "COMPANY_APPLICATION",
        targetUserId: application.userId,
        action: "VERIFY_DOCUMENT",
        notes: `Verified user ${application.userId} ${document.type} document`,
        ipHash: crypto.createHash("sha256").update(ip).digest("hex") || "",
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(200).json({
      success: true,
      message: `${document.type} Document Verified`,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to Verify Document",
    });
  }
};

export const approveCompanyApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(404).json({
        message: "Application ID is required",
      });
    }

    const application = await prisma.companyApplication.findUnique({
      where: { id: applicationId },
      include: {
        companyInfo: true,
      },
    });

    // TODO: check if user email is verifed before apporval
    if (!application.companyInfo) {
      return res.status(400).json({
        message: "All Company fields are required",
      });
    }

    const documents = await prisma.companyDocument.findMany({
      where: { companyApplicationId: application.id },
    });

    const requiredDocs = ["CERTIFICATE", "LICENSE", "OWNER_ID"];

    const uploadedTypes = documents.map((doc) => doc.type);

    const missingDocs = requiredDocs.filter(
      (doc) => !uploadedTypes.includes(doc),
    );

    if (missingDocs.length > 0) {
      return res.status(400).json({
        message: "Missing required documents",
      });
    }

    const unVerifiedDocs = documents.filter((doc) => !doc.isVerified);
    const responseMessage =
      unVerifiedDocs.length > 0
        ? unVerifiedDocs.map((doc) => doc.type).join(", ")
        : unVerifiedDocs[0]?.type;

    if (unVerifiedDocs.length > 0) {
      return res.status(400).json({
        message: `${responseMessage} Document(s) not verified yet`,
      });
    }
    const ip = generateIp(req);

    const updated = await prisma.companyApplication.update({
      where: { id: application.id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
      include: {
        companyInfo: true,
      },
    });

    const company = await prisma.company.create({
      data: {
        ownerId: application.userId,
        name: application.companyInfo.name,
        email: application.companyInfo.email,
        logo: application.companyInfo.logo,
        website: application.companyInfo.website,
      },
    });
    await prisma.companyMember.create({
      data: {
        userId: application.userId,
        companyId: company.id,
        role: "ADMIN",
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        entityId: applicationId,
        entityType: "COMPANY_APPLICATION",
        targetUserId: application.userId,
        targetCompanyId: company.id,
        action: "APPROVE",
        notes: `Approved company ${company.id}`,
        ipHash: crypto.createHash("sha256").update(ip).digest("hex") || "",
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(200).json({
      success: true,
      message: "Application approved successfully",
      updated,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to approve company application",
    });
  }
};

export const rejectCompanyApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes, reason } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        message: "Application ID is required ",
      });
    }
    const application = await prisma.companyApplication.findUnique({
      where: { id: applicationId },
    });
    const ip = generateIp(req);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.companyApplication.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
        },
      });
      await tx.companyApplicationReview.create({
        data: {
          companyApplicationId: applicationId,
          reviewerId: req.user.id,
          decision: "REJECTED",
          notes: notes || "",
          reason: reason || "",
        },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user.id,
          entityId: applicationId,
          entityType: "COMPANY_APPLICATION",
          targetUserId: application.userId,
          action: "REJECT",
          notes: `Rejected user ${application.userId}`,
          ipHash: crypto.createHash("sha256").update(ip).digest("hex") || "",
          userAgent: req.headers["user-agent"],
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: `Application rejected successfully`,
      updated,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to reject company application",
    });
  }
};
