import { prisma, isDbAvailable } from "../src/lib/prisma";
import { defaultCategories } from "../src/lib/defaults";

async function main() {
  console.log("Seeding database with default categories...");

  if (!isDbAvailable || !prisma) {
    console.warn("\n⚠️ DATABASE CONNECTION WARNING:");
    console.warn("Could not connect to database (Prisma client not available). Skipping seed operations.");
    console.warn("Ensure you configure a valid Neon DATABASE_URL in your .env file.\n");
    return;
  }

  for (const cat of defaultCategories) {
    try {
      // Clear existing to avoid duplicate conflicts during testing
      const existing = await prisma.category.findUnique({
        where: { name: cat.name },
        include: { items: true }
      });

      if (existing) {
        await prisma.category.delete({ where: { id: existing.id } });
      }

      const created = await prisma.category.create({
        data: {
          name: cat.name,
          items: {
            create: cat.items.map((item) => ({
              name: item.name,
              color: item.color
            }))
          }
        }
      });

      console.log(`Seeded category: ${created.name} with ${cat.items.length} items.`);
    } catch (e) {
      console.error(`Failed to seed category ${cat.name}:`, e);
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(0); // Exit gracefully
  })
  .finally(async () => {
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch (e) {}
    }
  });
