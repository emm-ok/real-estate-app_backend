import { prisma } from "../lib/prisma.js"

export const checkIfComplete = async(applicationId) => {
    const application = await prisma.agentApplication.findUnique({
        where: { id: applicationId},
        include: {
            professional: true,
            documents: true,
        }
    })

    if(!application.professional) return false;

    const requiredDocs = ["ID_CARD", "LICENSE", "SELFIE"];

    const uploadedDocTypes = application.documents.map((doc) => doc.type);

    return requiredDocs.every((doc) => uploadedDocTypes.includes(doc));
}


export const generateIp = (req) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "";

  return ip;
};


export const checkUploadComplete = async (application, res) => {
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
        missingDocs,
      });
    }
    return true;
}