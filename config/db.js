import { prisma } from "../lib/prisma.js";

export const connectToDB = async () => {
  try {
    await prisma.$connect();
    process.exit(0);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  } finally{
    await prisma.$disconnect();
  }
};

// const prisma  = new PrismaClient({
//     log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
// });
