const API_URL = "/api/students";
const SUMMARY_URL = "/api/summary";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("studentForm");
    const clearBtn = document.getElementById("clearBtn");
    const refreshBtn = document.getElementById("refreshBtn");

    if (form) form.addEventListener("submit", addStudent);
    if (clearBtn) clearBtn.addEventListener("click", clearForm);
    if (refreshBtn) refreshBtn.addEventListener("click", refreshData);

    loadStudents();
    loadSummary();
});

async function loadStudents() {
    const table = document.getElementById("studentTableBody");

    try {
        const response = await fetch(API_URL, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || "Failed to fetch students");
        }

        const students = Array.isArray(data) ? data : (data.students || []);

        displayStudents(students);
        updateTotalStudents(students.length);
    } catch (error) {
        console.error("LOAD STUDENTS ERROR:", error);

        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Unable to load students.
                    </td>
                </tr>`;
        }

        updateTotalStudents(0);
        showMessage("Unable to load students: " + error.message, "error");
    }
}

function displayStudents(students) {
    const table = document.getElementById("studentTableBody");
    if (!table) return;

    if (!students.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No students found.
                </td>
            </tr>`;
        return;
    }

    table.innerHTML = students.map(student => `
        <tr>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.email)}</td>
            <td>${student.age}</td>
            <td>${escapeHTML(student.course)}</td>
            <td>${student.marks}</td>
            <td>
                <button class="edit-btn" onclick="editStudent('${student._id}')">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteStudent('${student._id}')">🗑️ Delete</button>
            </td>
        </tr>
    `).join("");
}

function updateTotalStudents(count) {
    const element = document.getElementById("totalStudents");
    if (element) element.textContent = count;
}

async function addStudent(event) {
    event.preventDefault();

    const button = document.querySelector("#studentForm button[type='submit']");
    if (button) {
        button.disabled = true;
        button.textContent = "Adding...";
    }

    try {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const age = Number(document.getElementById("age").value);
        const course = document.getElementById("course").value.trim();
        const marks = Number(document.getElementById("marks").value);

        if (!name || !email || !course) {
            throw new Error("Please fill all required fields.");
        }

        if (!Number.isInteger(age) || age < 1) {
            throw new Error("Age must be a valid positive number.");
        }

        if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
            throw new Error("Marks must be between 0 and 100.");
        }

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                age,
                course,
                marks
            })
        });

        const data = await response.json();

        console.log("CREATE RESPONSE:", data);

        if (!response.ok) {
            throw new Error(data.error || data.message || "Error creating student");
        }

        document.getElementById("studentForm").reset();

        showMessage("✅ Student added successfully!", "success");

        await loadStudents();
        await loadSummary();

    } catch (error) {
        console.error("CREATE STUDENT ERROR:", error);
        showMessage("❌ " + error.message, "error");
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Add Student";
        }
    }
}

async function editStudent(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || "Unable to get student");
        }

        const student = data.student || data;

        const name = prompt("Student Name:", student.name);
        if (name === null) return;

        const email = prompt("Email:", student.email);
        if (email === null) return;

        const age = prompt("Age:", student.age);
        if (age === null) return;

        const course = prompt("Course:", student.course);
        if (course === null) return;

        const marks = prompt("Marks:", student.marks);
        if (marks === null) return;

        const updateResponse = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name.trim(),
                email: email.trim(),
                age: Number(age),
                course: course.trim(),
                marks: Number(marks)
            })
        });

        const updateData = await updateResponse.json();

        if (!updateResponse.ok) {
            throw new Error(
                updateData.error ||
                updateData.message ||
                "Error updating student"
            );
        }

        showMessage("✅ Student updated successfully!", "success");

        await loadStudents();
        await loadSummary();

    } catch (error) {
        console.error("UPDATE ERROR:", error);
        showMessage("❌ " + error.message, "error");
    }
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || "Error deleting student");
        }

        showMessage("✅ Student deleted successfully!", "success");

        await loadStudents();
        await loadSummary();

    } catch (error) {
        console.error("DELETE ERROR:", error);
        showMessage("❌ " + error.message, "error");
    }
}

async function loadSummary() {
    const element = document.getElementById("summaryContent");
    if (!element) return;

    try {
        const response = await fetch(SUMMARY_URL, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || "Summary unavailable");
        }

        const students = Array.isArray(data)
            ? data
            : (data.students || []);

        if (!students.length) {
            element.innerHTML = "<p>No students available.</p>";
            return;
        }

        element.innerHTML = students.map((student, index) => `
            <div class="top-student">
                <span>🏆 ${index + 1}. ${escapeHTML(student.name)}</span>
                <strong>${student.marks} marks</strong>
            </div>
        `).join("");

    } catch (error) {
        console.error("SUMMARY ERROR:", error);
        element.innerHTML = "<p>Summary service unavailable.</p>";
    }
}

async function refreshData() {
    await loadStudents();
    await loadSummary();
    showMessage("🔄 Records refreshed.", "success");
}

function clearForm() {
    const form = document.getElementById("studentForm");
    if (form) form.reset();
    hideMessage();
}

function showMessage(message, type) {
    const element = document.getElementById("message");
    if (!element) return;

    element.textContent = message;
    element.className = `message ${type}`;

    setTimeout(() => {
        hideMessage();
    }, 3500);
}

function hideMessage() {
    const element = document.getElementById("message");
    if (!element) return;

    element.textContent = "";
    element.className = "message";
}

function escapeHTML(value) {
    if (value === undefined || value === null) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
