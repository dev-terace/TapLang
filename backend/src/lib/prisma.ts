import { PrismaClient as PostgresClient } from "../../generated/postgres";
import { PrismaClient as MongoClient } from "../../generated/mongo";

export const postgresPrisma = new PostgresClient({
  log: ["query"],
});

export const mongoPrisma = new MongoClient({
  log: ["query"],
});