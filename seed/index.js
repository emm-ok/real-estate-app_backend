import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

const seed = async () => {
  await prisma.$connect();

  const hashedPassword = await bcrypt.hash("Su5t41npad", 10);
  
  const user = await prisma.user.createMany({
    data: [
      {name: "Dave Nick", email: "davenick@gmail.com", password: hashedPassword},
      {name: "John Doe", email: "johndoe@gmail.com", password: hashedPassword},
      {name: "Jane Doe", email: "janedoe@gmail.com", password: hashedPassword}
    ],
  });

  console.log("✅ User created successfully");
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
