const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const studentRoutes = require("./routes/studentRoutes");
const summaryRoutes = require("./api/summary");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Student CRUD API is running"
    });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

async function connectDB() {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(MONGODB_URI, {
        family: 4
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
}

// Protect only API routes with database connection
app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

// APIs
app.use("/api/students", studentRoutes);
app.use("/api/summary", summaryRoutes);

// Frontend fallback
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Local server
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log("=================================");
                console.log("Student CRUD Server Started");
                console.log("=================================");
                console.log(`Server: http://localhost:${PORT}`);
                console.log(`Students API: http://localhost:${PORT}/api/students`);
                console.log(`Summary API: http://localhost:${PORT}/api/summary`);
            });
        })
        .catch((error) => {
            console.error("MongoDB connection failed:", error.message);
            process.exit(1);
        });
}

module.exports = app;
