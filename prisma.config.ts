import { defineConfig } from "prisma/config";

// Used only by the Prisma CLI (generate / local migrate dev / studio).
// The app itself connects to Turso at runtime via the libSQL driver adapter (see src/lib/prisma.ts).
export default defineConfig({
  datasource: {
    url: "file:./dev.db",
  },
});
