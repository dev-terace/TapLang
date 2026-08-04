import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_DATABASE_URL;

if (!uri) {
  throw new Error("MONGODB_DATABASE_URL is not defined");
}

const client = new MongoClient(uri);

let db: Db;

export const connectMongoDB = async () => {
  if (!db) {
    await client.connect();
    db = client.db();
    console.log("MongoDB native client connected");
  }

  return db;
};

export { client };