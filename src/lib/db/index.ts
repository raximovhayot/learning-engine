import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Database operations will fail.");
}

// Use a lazy getter so the module loads without crashing even if DATABASE_URL
// is missing. The first actual query will throw a clear error caught by
// route-level try-catch handlers.
function createDb() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Please configure your database connection."
    );
  }
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop, receiver) {
    if (!_db) {
      _db = createDb();
    }
    const value = Reflect.get(_db, prop, receiver);
    return typeof value === "function" ? value.bind(_db) : value;
  },
});
