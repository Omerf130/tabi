import "server-only";

import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __tabiMongoose?: MongooseCache;
};

function getCache(): MongooseCache {
  if (!globalForMongoose.__tabiMongoose) {
    globalForMongoose.__tabiMongoose = { conn: null, promise: null };
  }
  return globalForMongoose.__tabiMongoose;
}

export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Database is not configured");
  }

  const cache = getCache();
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
