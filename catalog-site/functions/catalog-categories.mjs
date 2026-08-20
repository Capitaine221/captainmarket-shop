import { createClient } from "@libsql/client";
import { checkPassword, unauthorized, listExtraProducts, json } from "./_shared.mjs";

export default async (req) => {
  if (!checkPassword(req)) return unauthorized();

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const { rows: categories } = await client.execute(
    `SELECT slug, name FROM Category WHERE slug != 'frontpage' ORDER BY createdAt ASC`
  );
  client.close();

  let extras = [];
  try {
    extras = await listExtraProducts();
  } catch (err) {
    console.error('Failed to read catalog-only products from Blobs:', err);
  }

  return json({ categories, extras });
};

export const config = { path: "/.netlify/functions/catalog-categories" };
