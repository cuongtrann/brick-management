// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
try { require("dotenv/config"); } catch (e) {}
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
