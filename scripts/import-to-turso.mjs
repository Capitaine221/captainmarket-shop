import { createClient } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dumpPath = path.join(__dirname, "..", "turso-import.sql");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars before running this script.");
  process.exit(1);
}

const client = createClient({ url, authToken });

function splitStatements(sql) {
  // Simple splitter: statements are one-per-line in our generated dump (no embedded semicolons in string values
  // since we don't have any; CREATE TABLE statements may be multi-line but end with a lone ");" line).
  return sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const sql = fs.readFileSync(dumpPath, "utf-8");
  const statements = splitStatements(sql).filter((s) => s !== "BEGIN TRANSACTION" && s !== "COMMIT" && s !== "PRAGMA foreign_keys=OFF");

  console.log(`Executing ${statements.length} statements against Turso...`);
  for (const stmt of statements) {
    await client.execute(stmt);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => client.close());
