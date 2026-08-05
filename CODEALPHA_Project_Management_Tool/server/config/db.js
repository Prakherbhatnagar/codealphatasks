import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/project_management_db';
    
    // Set low selection timeout to quickly fallback to memory server if local MongoDB isn't running
    mongoose.set('strictQuery', false);
    
    try {
      const conn = await mongoose.connect(connStr, {
        serverSelectionTimeoutMS: 2000
      });
      console.log(`[MongoDB] Connected to external MongoDB instance: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.log(`[MongoDB] External connection failed (${err.message}). Starting MongoMemoryServer...`);
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to MongoMemoryServer at: ${memoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    process.exit(1);
  }
};
