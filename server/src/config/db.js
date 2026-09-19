import mongoose from "mongoose";
// import { setServers } from "node:dns/promises";

const connectDB = async () => {
  try {
    // setServers(["1.1.1.1", "8.8.8.8"]);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;