import mongoose, { Mongoose } from "mongoose";

const Mongoose_url:string = process.env.MONGOOSE_URL || "mongodb://localhost:27017/test";
interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;

}
const globalWithMongoose = global as typeof global & { mongoose: MongooseConnection };
let cached: MongooseConnection = globalWithMongoose.mongoose = { conn: null, promise: null };
if(!cached){
    cached = (global as typeof global & { mongoose: MongooseConnection }).mongoose = { conn: null, promise: null };

}
export const connectDB = async () => {
    if(cached.conn) return cached.conn;
    console.log("Connecting to DB");
    if(!Mongoose_url) throw new Error("Mongoose url is not provided");
    if(!cached.promise) {
        cached.promise = mongoose.connect(Mongoose_url,{
            dbName: "Imaginify",
            bufferCommands: false,
        });
        console.log("Connected to DB")
    }
}


