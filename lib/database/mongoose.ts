import mongoose, { Mongoose } from "mongoose";

const Mongoose_url: string = process.env.MONGOOSE_URL || "mongodb://localhost:27017/test";

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const globalWithMongoose = global as typeof global & { mongoose: MongooseConnection };
let cached: MongooseConnection = globalWithMongoose.mongoose || { conn: null, promise: null };

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!Mongoose_url) throw new Error("Mongoose URL is not provided");

  if (!cached.promise) {
    cached.promise = mongoose.connect(Mongoose_url, {
      dbName: "Imaginify",
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("Connected to DB");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};
