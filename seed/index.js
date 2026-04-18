import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

const seed = async () => {
  await prisma.$connect();

  const hashedPassword = await bcrypt.hash("Su5t41npad.", 10);

  const user = await prisma.user.createMany({
    data: [
      {
        name: "Admin",
        email: "futlord77@gmail.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    ],
  });

  console.log("✅ Admin User created successfully");
  console.log(user);
  console.log("Seed Completed");
};

seed()
  .catch((error) => {
    console.error("Seed Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
