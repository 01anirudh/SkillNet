import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Database connected"));
        await mongoose.connect(`${process.env.MONGODB_URL}SkillNet`, {
            serverSelectionTimeoutMS: 5000  // 5 second timeout
        });
    } catch(error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);  // Stop server if DB fails
    }
}

export default connectDB;