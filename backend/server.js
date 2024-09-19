import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middlewares
// Set payload size limits to prevent PayloadTooLargeError
app.use(express.json({ limit: '50mb' })); // Set JSON payload limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Set URL-encoded payload limit
app.use(cookieParser()); // Middleware to parse cookies in the request headers

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT, () => console.log(`Server Started at port ${PORT}`));
