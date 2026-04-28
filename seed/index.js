import { ListingStatus, ListingType, PropertyType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
// import bcrypt from "bcrypt";

// const seed = async () => {
//   await prisma.$connect();

//   const hashedPassword = await bcrypt.hash("Su5t41npad.", 10);

//   const user = await prisma.user.createMany({
//     data: [
//       {
//         name: "Admin",
//         email: "futlord77@gmail.com",
//         password: hashedPassword,
//         role: "ADMIN",
//       },
//     ],
//   });

//   console.log("✅ Admin User created successfully");
//   console.log(user);
//   console.log("Seed Completed");
// };

// seed()
//   .catch((error) => {
//     console.error("Seed Error:", error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });



import { faker } from "@faker-js/faker";


async function main() {
  // 👉 Get an existing agent (REQUIRED)
  const agent = await prisma.agent.findFirst();

  if (!agent) {
    throw new Error("No agent found. Seed an agent first.");
  }

  // await prisma.agent.create({
  //   data: {
  //     userId: "c04280d2-a9f4-47d7-9129-f9a4482fa29d",
  //   }
  // })
  // console.log("Agent created")

  const listings = [];

  for (let i = 0; i < 10; i++) {
    const title = faker.location.streetAddress();

    listings.push({
      agentId: agent.id,

      title,
      description: faker.lorem.paragraph(),
      slug: faker.helpers.slugify(title + "-" + i),

      price: faker.number.float({ min: 50000, max: 500000, precision: 0.01 }),
      currency: "USD",

      type: faker.helpers.arrayElement(Object.values(PropertyType)),
      listingType: faker.helpers.arrayElement(Object.values(ListingType)),
      condition: "NEW",

      bedrooms: faker.number.int({ min: 1, max: 6 }),
      bathrooms: faker.number.int({ min: 1, max: 4 }),
      parkingSpaces: faker.number.int({ min: 0, max: 3 }),

      areaSize: faker.number.float({ min: 50, max: 500 }),
      areaUnit: "sqm",

      lotSize: faker.number.float({ min: 100, max: 1000 }),
      yearBuilt: faker.number.int({ min: 1990, max: 2024 }),

      furnishing: faker.helpers.arrayElement([
        "Furnished",
        "Semi-Furnished",
        "Unfurnished",
      ]),

      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),

      lat: faker.location.latitude(),
      lng: faker.location.longitude(),

      status: ListingStatus.ACTIVE,
      uploadedAt: new Date(),
    });
  }

  // 👉 Insert into DB
  await prisma.listing.createMany({
    data: listings,
  });

  console.log("✅ 10 listings seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });