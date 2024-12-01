import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
} from "@mui/material";

const StudentForm = () => {
  const [formData, setFormData] = useState({
    Class: "",
    RollNumber: "",
    NameOfTheStudent: "",
    FatherName: "",
    Section: "",
  });

  const [loading, setLoading] = useState(false); // For submit button loading state
  const [errors, setErrors] = useState({}); // For inline validation errors

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Class) newErrors.Class = "Class is required";
    if (!formData.RollNumber.trim()) newErrors.RollNumber = "Roll Number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToGoogleSheet = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/save", data);
      console.log("Backend response:", response.data.message);
      alert(response.data.message);

      // Reset form data except for the "Class" field
      setFormData((prevData) => ({
        ...prevData,
        RollNumber: "",
        NameOfTheStudent: "",
        FatherName: "",
        Section: "",
      }));
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Sending Data to Backend:", formData);
      saveToGoogleSheet(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on change
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: 4,
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Student Attendance Registration
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth error={Boolean(errors.Class)}>
              <InputLabel>Select Class</InputLabel>
              <Select
                name="Class"
                value={formData.Class}
                onChange={handleChange}
                label="Select Class"
              >
                <MenuItem value="" disabled>
                  Select class
                </MenuItem>
                {Array.from({ length: 10 }, (_, i) => (
                  <MenuItem key={i + 1} value={`Class${i + 1}`}>
                    Class{i + 1}
                  </MenuItem>
                ))}
              </Select>
              {errors.Class && (
                <Typography variant="caption" color="error">
                  {errors.Class}
                </Typography>
              )}
            </FormControl>
          </Grid>
          {Object.keys(formData)
            .filter((key) => key !== "Class")
            .map((key) => (
              <Grid item xs={12} key={key}>
                <Tooltip title={`Enter ${key.replace(/([A-Z])/g, " $1").trim()}`} arrow>
                  <TextField
                    fullWidth
                    label={key.replace(/([A-Z])/g, " $1").trim()}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    placeholder={`Enter your ${key.toLowerCase()}`}
                    variant="outlined"
                    error={Boolean(errors[key])}
                    helperText={errors[key] || " "}
                  />
                </Tooltip>
              </Grid>
            ))}
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                paddingX: 3,
                paddingY: 1,
                borderRadius: "25px",
                minWidth: "150px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default StudentForm;
