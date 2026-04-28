import { prisma } from "../../lib/prisma.js";
import crypto from "crypto";
import { stepSchemas } from "../../lib/validation.js";
import { generateIp } from "../../utils/checkCompletion.js";
import cloudinary from "../../config/cloudinary.js";

export const createAgentApplication = async (req, res) => {
  try {
    const existingApplication = await prisma.agentApplication.findFirst({
      where: { userId: req.user.id },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You already have an active agent application",
      });
    }
    const ip = generateIp(req);
    await prisma.agentApplication.create({
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
              note: "Agent Application created",
            },
          ],
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Agent Application created successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to create agent application",
    });
  }
};

export const getMyAgentApplication = async (req, res) => {
  try {
    const existingApplication = await prisma.agentApplication.findFirst({
      where: {
        userId: req.user.id,
        status: { not: "APPROVED" },
      },
      include: {
        professional: true,
        documents: true,
        reviews: true,
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
      message: "Agent Application retrieved successfully",
      application: existingApplication,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to fetch agent application",
    });
  }
};

export const updateAgentApplication = async (req, res) => {
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

    const schema = stepSchemas[step];
    if (schema) {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        console.log(parsed.error.format());
        return res.status(400).json({
          message: parsed.error.format(),
        });
      }
      var data = parsed.data;
    }
    console.log("STEP:", step);
    console.log("BODY:", req.body);
    console.log("DATA:", data);

    let updateData = {};

    if (step === 3) {
      if (!data?.professional) {
        return res.status(400).json({
          message: "Professional data is required",
        });
      }

      const specialization = Array.isArray(data.professional.specialization)
        ? data.professional.specialization
        : [data.professional.specialization];

      updateData.professional = {
        upsert: {
          create: {
            ...data.professional,
            specialization,
          },
          update: {
            ...data.professional,
            specialization,
          },
        },
      };
    }

    if (step === 4) {
      const documents = await prisma.agentDocument.findMany({
        where: { agentApplicationId: application.id },
      });

      const requiredDocs = ["ID_CARD", "LICENSE", "SELFIE"];

      const uploadedTypes = documents.map((doc) => doc.type);

      const missingDocs = requiredDocs.filter(
        (doc) => !uploadedTypes.includes(doc),
      );

      if (missingDocs.length > 0) {
        console.log(missingDocs.join(", "));
        return res.status(400).json({
          message: "Missing required documents",
          missingDocs,
        });
      }
    }

    updateData.currentStep = Math.max(application.currentStep, step);

    const updated = await prisma.agentApplication.update({
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
        professional: true,
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

export const uploadAgentDocument = async (req, res) => {
  try {
    const { application } = req;
    const { type } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    console.log("Backend req file", req.file);
    const document = await prisma.agentDocument.upsert({
      where: {
        agentApplicationId_type: {
          agentApplicationId: application.id,
          type,
        },
      },
      update: {
        url: req.file.path,
        publicId: req.file.filename,
        isVerified: false,
      },
      create: {
        agentApplicationId: application.id,
        type,
        url: req.file.path,
        publicId: req.file.filename,
        isVerified: false,
      },
    });

    await prisma.agentApplicationHistory.create({
      data: {
        agentApplicationId: application.id,
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

export const deleteAgentDocument = async (req, res) => {
  try {
    const { application } = req;
    const { type } = req.params;

    const existing = await prisma.agentDocument.findUnique({
      where: {
        agentApplicationId_type: {
          agentApplicationId: application.id,
          type,
        },
      },
    });
    console.log("Existing Docuemnt", existing)

    if (!existing) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const { result } = await cloudinary.uploader.destroy(existing.publicId, {
      resource_type: "raw",
    });

    console.log(result)

    if (result !== "ok" && result !== "not found") {
      throw new Error("Cloudinary deletion failed");
    }

    await prisma.agentDocument.delete({
      where: {
        agentApplicationId_type: {
          agentApplicationId: application.id,
          type,
        },
      },
    });

    await prisma.agentApplicationHistory.create({
      data: {
        agentApplicationId: application.id,
        action: "DOCUMENT_DELETED",
        performedById: req.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${type} deleted succesfully`,
    });
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({
      success: false,
      message: `Failed to delete document`,
    });
  }
};

export const deleteAgentApplication = async (req, res) => {
  try {
    const { application } = req;

    await prisma.$transaction([
      prisma.agentApplicationHistory.create({
        data: {
          agentApplicationId: application.id,
          action: "DELETE_APPLICATION",
          performedById: req.user.id,
        },
      }),
      prisma.agentApplication.delete({
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
      message: "Failed to delete agent application",
    });
  }
};

export const submitAgentApplication = async (req, res) => {
  try {
    const { application } = req;

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

    if (!application.professional) {
      return res.status(400).json({
        message: "Professional information is required",
      });
    }

    const documents = await prisma.agentDocument.findMany({
      where: { agentApplicationId: application.id },
    });

    const requiredDocs = ["ID_CARD", "LICENSE", "SELFIE"];

    const uploadedTypes = documents.map((doc) => doc.type);

    const missingDocs = requiredDocs.filter(
      (doc) => !uploadedTypes.includes(doc),
    );

    if (missingDocs.length > 0) {
      return res.status(400).json({
        message: "Missing required documents",
        missingDocs,
      });
    }

    const updated = await prisma.agentApplication.update({
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
      message: "Application submittd successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to submit agent application",
    });
  }
};

// Admin Actions
export const getAgentApplications = async (req, res) => {
  try {
    const applications = await prisma.agentApplication.findMany({
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
      message: "Failed to fetch agent applications",
    });
  }
};

export const getAgentApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(404).json({
        message: "Application ID is required",
      });
    }

    const application = await prisma.agentApplication.findUnique({
      where: { id: applicationId },
      include: {
        professional: true,
        documents: true,
        reviews: true,
        verification: true,
        history: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    await prisma.agentApplication.update({
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
      message: "Failed to fetch agent application",
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

    const document = await prisma.agentDocument.findUnique({
      where: {
        id: docId,
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }
    await prisma.agentDocument.update({
      where: { id: document.id },
      data: { isVerified: true },
    });

    const application = await prisma.agentApplication.findUnique({
      where: { id: document.agentApplicationId },
    });

    await prisma.agentApplicationHistory.create({
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
        entityType: "AGENT_APPLICATION",
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

export const approveAgentApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(404).json({
        message: "Application ID is required",
      });
    }

    const application = await prisma.agentApplication.findUnique({
      where: { id: applicationId },
      include: {
        professional: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }
    // TODO: check if user email is verifed before apporval
    if (!application.professional) {
      return res.status(400).json({
        message: "All Professional fields are required",
      });
    }

    const documents = await prisma.agentDocument.findMany({
      where: { agentApplicationId: application.id },
    });

    const requiredDocs = ["ID_CARD", "LICENSE", "SELFIE"];

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

    const updated = await prisma.$transaction(async (tx) => {
      (await tx.agentApplication.update({
        where: { id: application.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      }),
        await tx.agent.create({
          data: {
            userId: application.userId,
          },
        }));
      await tx.user.update({
        where: { id: application.userId },
        data: { role: "AGENT" },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user.id,
          entityId: applicationId,
          entityType: "AGENT_APPLICATION",
          targetUserId: application.userId,
          action: "APPROVE",
          notes: `Approved user ${application.userId}`,
          ipHash: crypto.createHash("sha256").update(ip).digest("hex") || "",
          userAgent: req.headers["user-agent"],
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Application approved successfully",
      updated,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to approve agent application",
    });
  }
};

export const rejectAgentApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes, reason } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        message: "Application ID is required ",
      });
    }
    const application = await prisma.agentApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const ip = generateIp(req);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.agentApplication.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
        },
      });
      await tx.agentApplicationReview.create({
        data: {
          agentApplicationId: applicationId,
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
          entityType: "AGENT_APPLICATION",
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
      message: `Application rejectedq successfully`,
      updated,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to reject agent application",
    });
  }
};
