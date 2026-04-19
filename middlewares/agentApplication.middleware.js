import { prisma } from "../lib/prisma.js";

export const validateUser = async(req, res, next) => {
  if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account not active",
      });
    }
    next()
}

export const validateApplicationUpdate = async (req, res, next) => {
  try {
    const application = await prisma.agentApplication.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["DRAFT", "REJECTED"] },
      },
      include: {
        professional: true,
      }
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: "Only draft or rejected applications can be modified.",
      });
    }

    req.application = application;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Validation failed",
    });
  }
};

export const validateCompanyApplicationUpdate = async (req, res, next) => {
  try {
    const application = await prisma.companyApplication.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["DRAFT", "REJECTED"] },
      },
      include: {
        companyInfo: true,
      }
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: "Only draft or rejected applications can be modified.",
      });
    }

    req.application = application;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Validation failed",
    });
  }
};


export const validateDocumentType = async(req, res, next) => {
    const allowed = ["ID_CARD", "LICENSE", "SELFIE"];

    if(!allowed.includes(req.params.type)){
        return res.status(400).json({
            message: "Invalid document type"
        })
    }

    next();
}

export const validateCompanyDocumentType = async(req, res, next) => {
    const allowed = ["CERTIFICATE", "LICENSE", "OWNER_ID"];

    if(!allowed.includes(req.params.type)){
        return res.status(400).json({
            message: "Invalid document type"
        })
    }

    next();
}


