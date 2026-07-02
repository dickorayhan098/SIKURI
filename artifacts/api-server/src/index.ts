import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable } from "@workspace/db";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "sikuri_salt_2025").digest("hex");
}

async function seedAdminUser() {
  try {
    const existingUsers = await db.select().from(usersTable).limit(1);
    if (existingUsers.length === 0) {
      logger.info("Database is empty. Seeding default admin user...");
      const passwordHash = hashPassword("admin123");
      await db.insert(usersTable).values({
        nama: "Administrator",
        email: "admin@sikuri.id",
        password: passwordHash,
        role: "ADMIN",
        isAktif: true,
      });
      logger.info("Default admin user seeded successfully.");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed default admin user");
  }
}

// Export the Express app as default for Vercel Serverless Functions
export default app;

// Only start the standalone server when NOT running on Vercel
if (!process.env["VERCEL"]) {
  const rawPort = process.env["PORT"] || "8080";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  async function startServer() {
    await seedAdminUser();

    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  }

  startServer().catch((err) => {
    logger.fatal({ err }, "Fatal error starting server");
    process.exit(1);
  });
}
