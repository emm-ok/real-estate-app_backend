import { prisma } from "../lib/prisma"

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