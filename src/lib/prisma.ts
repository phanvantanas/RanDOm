import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

let prismaInstance: PrismaClient | null = null;
let dbIsAvailable = false;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && dbUrl.includes('.neon.tech')) {
  try {
    const adapter = new PrismaNeon({
      connectionString: dbUrl,
    });
    prismaInstance = new PrismaClient({ adapter });
    dbIsAvailable = true;
    console.log(" Prisma initialized successfully with Neon PostgreSQL driver adapter.");
  } catch (error) {
    console.error("Failed to initialize Prisma with Neon adapter:", error);
  }
} else {
  console.warn("\n DATABASE CONNECTION WARNING:");
  console.warn("DATABASE_URL is missing or is not a Neon connection string (containing '.neon.tech').");
  console.warn("The application will run in offline Mock Mode, persisting data to localStorage on the client side.\n");
}

export const prisma = prismaInstance;
export const isDbAvailable = dbIsAvailable;
