const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(bodyParser.json());
app.use(cors());

// Load credentials
const credentials = require("./credentials.json");
const SPREADSHEET_ID = "14r19p-tUEljUV2jPZ3XHAJLmrETESieXLlvbuXj4ygc"; // Hardcoded

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// Utility: Get current date in IST format (YYYY-MM-DD)
const getISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset: 5 hours 30 minutes
    const istTime = new Date(now.getTime() + istOffset);
    const year = istTime.getUTCFullYear();
    const month = String(istTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(istTime.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// Middleware: Input validation
const validateRequestBody = (keys) => (req, res, next) => {
    const missingKeys = keys.filter((key) => !req.body[key]);
    if (missingKeys.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingKeys.join(", ")}` });
    }
    next();
};

// Endpoint: Save data
app.post(
    "/save",
    validateRequestBody(["Class", "RollNumber", "NameOfTheStudent", "FatherName", "Section"]),
    async (req, res) => {
        try {
            const { Class, RollNumber, NameOfTheStudent, FatherName, Section } = req.body;
            const rows = [[RollNumber, NameOfTheStudent, FatherName, Section]];

            const response = await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${Class}!A1:D1`,
                valueInputOption: "RAW",
                resource: { values: rows },
            });

            res.status(200).send({ message: "Data saved successfully!" });
        } catch (error) {
            console.error("Error saving data:", error.message);
            res.status(500).send({ error: "Failed to save data" });
        }
    }
);

// Endpoint: Get today's attendance summary
app.get("/attendance/current/:classSheet", async (req, res) => {
    const { classSheet } = req.params;

    try {
        const currentDate = getISTDate();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${classSheet}!A1:Z`,
        });

        const data = response.data.values || [];
        const headers = data[0];
        const rows = data.slice(1);

        const dateIndex = headers.indexOf(currentDate);
        if (dateIndex === -1) {
            return res.status(400).json({ error: "No attendance marked for today." });
        }

        const todaySummary = rows.map((row) => ({
            rollNumber: row[0],
            studentName: row[1],
            status: row[dateIndex],
        }));

        res.json({ success: true, todaySummary });
    } catch (error) {
        console.error("Error fetching today's attendance:", error.message);
        res.status(500).json({ error: "Failed to fetch today's attendance" });
    }
});

// Endpoint: Get users
app.get("/getUsers", async (req, res) => {
    try {
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "User!A2:B",
        });

        res.status(200).send(getResponse.data.values);
    } catch (error) {
        console.error("Error fetching user data:", error.message);
        res.status(500).send({ error: "Failed to fetch user data" });
    }
});

// Endpoint: Update user info with validation
app.post(
    "/updateUser",
    validateRequestBody(["CurrentUsername", "NewUsername", "CurrentPassword", "NewPassword"]),
    async (req, res) => {
        try {
            const { CurrentUsername, NewUsername, CurrentPassword, NewPassword } = req.body;

            const getResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: "User!A2:B",
            });

            const rows = getResponse.data.values || [];
            const updatedRows = rows.map((row) =>
                row[0] === CurrentUsername && row[1] === CurrentPassword
                    ? [NewUsername, NewPassword]
                    : row
            );

            await sheets.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: "User!A2:B",
            });

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: "User!A2",
                valueInputOption: "RAW",
                resource: { values: updatedRows },
            });

            res.status(200).send({ message: "User info updated successfully!" });
        } catch (error) {
            console.error("Error updating user info:", error.message);
            res.status(500).send({ error: "Failed to update user info" });
        }
    }
);

// Endpoint: Attendance Tracker
app.post("/attendance/tracker", async (req, res) => {
    const { classSheet } = req.body;

    if (!classSheet) {
        return res.status(400).json({ error: "Missing required field: classSheet" });
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${classSheet}!A1:Z`,
        });

        const data = response.data.values || [];
        const headers = data[0];
        const rows = data.slice(1);

        const tracker = rows.map((row) => {
            const rollNumber = row[0];
            const studentName = row[1];
            const section = row[3];
            const attendanceStatuses = row.slice(4);
            const totalPresent = attendanceStatuses.filter((status) => status === "Present").length;
            const totalAbsent = attendanceStatuses.filter((status) => status === "Absent").length;
            const totalDays = totalPresent + totalAbsent;
            const attendancePercentage = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(2) : 0;

            return {
                rollNumber,
                studentName,
                section,
                totalPresent,
                totalAbsent,
                attendancePercentage,
            };
        });

        const totalStudents = tracker.length;
        const totalPresent = tracker.reduce((sum, student) => sum + student.totalPresent, 0);
        const totalAbsent = tracker.reduce((sum, student) => sum + student.totalAbsent, 0);

        const summary = {
            totalStudents,
            totalPresent,
            totalAbsent,
        };

        res.json({ success: true, tracker, summary });
    } catch (error) {
        console.error("Error fetching attendance tracker:", error.message);
        res.status(500).json({ error: "Failed to fetch attendance tracker" });
    }
});

// New Endpoints for modifying and deleting student information

// Endpoint: Search student
app.post("/search-student", validateRequestBody(["Class", "RollNumber"]), async (req, res) => {
    const { Class, RollNumber } = req.body;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${Class}!A2:Z`,
        });

        const rows = response.data.values || [];
        const studentRow = rows.find((row) => row[0] === RollNumber);

        if (!studentRow) {
            return res.status(404).json({ error: "Student not found." });
        }

        const studentData = {
            RollNumber: studentRow[0],
            NameOfTheStudent: studentRow[1],
            FatherName: studentRow[2],
            Section: studentRow[3],
        };

        res.json(studentData);
    } catch (error) {
        console.error("Error searching for student:", error.message);
        res.status(500).json({ error: "Failed to search for student" });
    }
});

// Endpoint: Update student
app.post("/update-student", validateRequestBody(["Class", "RollNumber", "NameOfTheStudent", "FatherName", "Section"]), async (req, res) => {
    const { Class, RollNumber, NameOfTheStudent, FatherName, Section } = req.body;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${Class}!A2:D`, // Ensure the range includes only valid data columns
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex((row) => row[0]?.trim() === RollNumber.trim());

        if (rowIndex === -1) {
            return res.status(404).json({ error: "Student not found." });
        }

        rows[rowIndex] = [RollNumber.trim(), NameOfTheStudent.trim(), FatherName.trim(), Section.trim()];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${Class}!A2`, // Always start from A2
            valueInputOption: "RAW",
            resource: { values: rows },
        });

        res.status(200).send({ message: "Student information updated successfully!" });
    } catch (error) {
        console.error("Error updating student data:", error.message);
        res.status(500).send({ error: "Failed to update student data" });
    }
});



// Endpoint: Get full attendance sheet
app.get("/attendance/full/:classSheet", async (req, res) => {
    const { classSheet } = req.params;
  
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${classSheet}!A1:Z`,
      });
  
      const data = response.data.values || [];
      const headers = data[0];
      const rows = data.slice(1);
  
      const attendanceData = rows.map((row) => ({
        rollNumber: row[0],
        studentName: row[1],
        dates: headers.slice(4), // Assuming that dates start from the 4th column
        statuses: row.slice(4)
      }));
  
      res.json({ success: true, attendanceData });
    } catch (error) {
      console.error("Error fetching full attendance sheet:", error.message);
      res.status(500).json({ error: "Failed to fetch full attendance sheet" });
    }
  });
  
  // Endpoint: Delete full attendance sheet
  app.delete("/attendance/full/:classSheet", async (req, res) => {
    const { classSheet } = req.params;
  
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              deleteSheet: {
                sheetId: (await getSheetId(classSheet))
              }
            }
          ]
        }
      });
  
      res.json({ success: true, message: `Attendance sheet for ${classSheet} deleted successfully.` });
    } catch (error) {
      console.error("Error deleting full attendance sheet:", error.message);
      res.status(500).json({ error: "Failed to delete full attendance sheet" });
    }
  });
  
  async function getSheetId(sheetTitle) {
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
  
    const sheet = sheetInfo.data.sheets.find(sheet => sheet.properties.title === sheetTitle);
    return sheet ? sheet.properties.sheetId : null;
  }


 // Endpoint: Create a new sheet
app.post("/sheet/create", async (req, res) => {
    const { sheetName } = req.body;
  
    try {
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }
          ]
        }
      });
  
      res.json({ success: true, message: `Sheet "${sheetName}" created successfully.` });
    } catch (error) {
      console.error("Error creating sheet:", error.message);
      res.status(500).json({ error: "Failed to create sheet" });
    }
  });
  
  
// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


