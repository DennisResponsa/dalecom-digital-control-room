import { env } from "cloudflare:workers";

export function getD1(): D1Database {
  const database = (env as unknown as { DB?: D1Database }).DB;
  if (!database) throw new Error("D1 binding DB unavailable");
  return database;
}
