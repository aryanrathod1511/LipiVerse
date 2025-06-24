import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  // Example: Create a user
  await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
