import mongoose from "mongoose";

const dbConnect = async () => {
    const uri = process.env.MONGODB_CONNECT;

    if (!uri) {
        throw new Error(
            "MONGODB_CONNECT is missing. Add your MongoDB connection string to the .env file."
        );
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.error("Check your .env file and MongoDB Atlas network access settings.");
        throw error;
    }
};

export default dbConnect;
