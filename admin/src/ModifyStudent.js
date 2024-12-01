import React, { useState } from "react";
import { Container, TextField, Button, Typography, CircularProgress, Box, MenuItem, Select, FormControl, InputLabel, Alert } from '@mui/material';

const ModifyStudent = () => {
    const [classInput, setClassInput] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [nameOfTheStudent, setNameOfTheStudent] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [section, setSection] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [logMessage, setLogMessage] = useState("");
    const [isUpdateVisible, setIsUpdateVisible] = useState(false);

    const classes = ["Class1", "Class2", "Class3", "Class4", "Class5", "Class6", "Class7", "Class8", "Class9", "Class10"];

    // Fetch student details for editing
    const handleSearchStudent = async () => {
        if (!classInput || !rollNumber) {
            setLogMessage("Please provide Class and Roll Number!");
            return;
        }

        setIsSearching(true);

        try {
            const response = await fetch("http://localhost:5000/search-student", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Class: classInput, RollNumber: rollNumber }),
            });

            const result = await response.json();

            if (response.ok) {
                setNameOfTheStudent(result.NameOfTheStudent || "");
                setFatherName(result.FatherName || "");
                setSection(result.Section || "");
                setIsUpdateVisible(true);
                setLogMessage("Student data fetched successfully!");
            } else {
                setLogMessage(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Error fetching student data:", error);
            setLogMessage("Failed to fetch student data.");
        } finally {
            setIsSearching(false);
        }
    };

    // Update student details
    const handleUpdateStudent = async () => {
        if (!classInput || !rollNumber || !nameOfTheStudent || !fatherName || !section) {
            setLogMessage("Please fill all the fields before updating!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/update-student", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Class: classInput,
                    RollNumber: rollNumber,
                    NameOfTheStudent: nameOfTheStudent,
                    FatherName: fatherName,
                    Section: section,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setLogMessage("Student updated successfully!");
                // Reset the form fields
                setClassInput("");
                setRollNumber("");
                setNameOfTheStudent("");
                setFatherName("");
                setSection("");
                setIsUpdateVisible(false);
            } else {
                setLogMessage(`Error updating student: ${result.error}`);
            }
        } catch (error) {
            console.error("Error updating student:", error);
            setLogMessage("Failed to update student.");
        }
    };

    return (
        <Container style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
            <Typography variant="h4" gutterBottom>
                Modify Student
            </Typography>
            {logMessage && <Alert severity="info" style={{ marginBottom: "20px" }}>{logMessage}</Alert>}
            <Box component="form">
                <FormControl fullWidth margin="normal">
                    <InputLabel>Class</InputLabel>
                    <Select
                        value={classInput}
                        onChange={(e) => setClassInput(e.target.value)}
                    >
                        {classes.map((className, index) => (
                            <MenuItem key={index} value={className}>{className}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Roll Number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="Enter Roll Number"
                    fullWidth
                    margin="normal"
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearchStudent}
                    disabled={isSearching}
                    fullWidth
                    style={{ marginTop: "20px" }}
                >
                    {isSearching ? <CircularProgress size={24} /> : "Search"}
                </Button>
                {isUpdateVisible && (
                    <>
                        <TextField
                            label="Name of the Student"
                            value={nameOfTheStudent}
                            onChange={(e) => setNameOfTheStudent(e.target.value)}
                            placeholder="Enter Name"
                            fullWidth
                            margin="normal"
                            style={{ marginTop: "20px" }}
                        />
                        <TextField
                            label="Father's Name"
                            value={fatherName}
                            onChange={(e) => setFatherName(e.target.value)}
                            placeholder="Enter Father's Name"
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Section"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            placeholder="Enter Section"
                            fullWidth
                            margin="normal"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdateStudent}
                            fullWidth
                            style={{ marginTop: "20px" }}
                        >
                            Update
                        </Button>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default ModifyStudent;
