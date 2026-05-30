import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

function createDb() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 10 });
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export function createSourceDb(url: string) {
  const sql = postgres(url, { max: 5 });
  return drizzle(sql, { schema });
}
