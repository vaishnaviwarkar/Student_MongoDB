const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// Read-only summary: total count + top 5 students
router.get("/", async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();

        const topStudents = await Student.find()
            .sort({ marks: -1, name: 1 })
            .limit(5)
            .select("name email course marks");

        res.json({
            success: true,
            totalStudents,
            students: topStudents
        });
    } catch (error) {
        console.error("SUMMARY ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Error generating summary",
            error: error.message
        });
    }
});

module.exports = router;
