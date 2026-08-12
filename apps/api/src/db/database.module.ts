import { Global, Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const TURSO_DB_URL = process.env.TURSO_DB_URL || "file:./data/signup.db";

export const DB = Symbol("DB");

function createDbConnection() {
  const client = createClient({
    url: TURSO_DB_URL,
    authToken: process.env.TURSO_DB_TOKEN,
  });
  return drizzle(client, { schema });
}

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: createDbConnection,
    },
  ],
  exports: [DB],
})
export class DatabaseModule {}
