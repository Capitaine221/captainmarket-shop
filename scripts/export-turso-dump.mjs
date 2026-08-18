import { createClient } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "prisma", "dev.db");
const outPath = path.join(__dirname, "..", "turso-import.sql");

const client = createClient({ url: `file:${dbPath}` });

function sqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "bigint") return String(value);
  if (value instanceof Uint8Array) {
    return "X'" + Buffer.from(value).toString("hex") + "'";
  }
  // string: escape single quotes
  return "'" + String(value).replace(/'/g, "''") + "'";
}

async function main() {
  const tablesRes = await client.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations' ORDER BY name"
  );

  const lines = [];
  lines.push("PRAGMA foreign_keys=OFF;");
  lines.push("BEGIN TRANSACTION;");

  for (const table of tablesRes.rows) {
    const name = table.name;
    const createSql = table.sql;
    lines.push(`DROP TABLE IF EXISTS "${name}";`);
    lines.push(createSql + ";");
  }

  for (const table of tablesRes.rows) {
    const name = table.name;
    const dataRes = await client.execute(`SELECT * FROM "${name}"`);
    const columns = dataRes.columns;
    for (const row of dataRes.rows) {
      const values = columns.map((col) => sqlLiteral(row[col]));
      lines.push(`INSERT INTO "${name}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${values.join(", ")});`);
    }
    console.log(`Dumped ${dataRes.rows.length} rows from ${name}`);
  }

  lines.push("COMMIT;");

  fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf-8");
  console.log(`\nWrote ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => client.close());
