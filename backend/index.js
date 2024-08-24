import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDb from "./db/connectMongoDb.js";

const app = express();
dotenv.config();

// Parse JSON bodies
app.use(express.json());

// Define the port
const PORT = process.env.PORT || 5000;

// Define routes
app.use("/api/auth", authRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    connectMongoDb();
});
