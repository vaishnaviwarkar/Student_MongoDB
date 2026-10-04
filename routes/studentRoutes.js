const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// CREATE student
router.post("/", async (req, res) => {
    try {
        console.log("POST /api/students:", req.body);

        const student = await Student.create({
            name: req.body.name,
            email: req.body.email,
            age: Number(req.body.age),
            course: req.body.course,
            marks: Number(req.body.marks)
        });

        res.status(201).json({
            success: true,
            message: "Student created successfully",
            student
        });
    } catch (error) {
        console.error("CREATE STUDENT ERROR:", error);

        // MongoDB duplicate email
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A student with this email already exists.",
                error: "Duplicate email"
            });
        }

        res.status(400).json({
            success: false,
            message: "Error creating student",
            error: error.message
        });
    }
});

// READ all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            students
        });
    } catch (error) {
        console.error("GET STUDENTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching students",
            error: error.message
        });
    }
});

// READ one student
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            student
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid student ID",
            error: error.message
        });
    }
});

// UPDATE student
router.put("/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                age: Number(req.body.age),
                course: req.body.course,
                marks: Number(req.body.marks)
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            message: "Student updated successfully",
            student
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A student with this email already exists.",
                error: "Duplicate email"
            });
        }

        res.status(400).json({
            success: false,
            message: "Error updating student",
            error: error.message
        });
    }
});

// DELETE student
router.delete("/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            message: "Student deleted successfully",
            student
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error deleting student",
            error: error.message
        });
    }
});

module.exports = router;
