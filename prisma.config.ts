import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";
import { config } from "dotenv";

// Load .env.local so Prisma CLI picks up the real DATABASE_URL
config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "postgresql://localhost:5432/befitbestrong",
  },
});
