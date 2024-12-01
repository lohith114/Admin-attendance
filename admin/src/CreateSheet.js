import React, { useState } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button, Alert } from "@mui/material";

const CreateSheet = () => {
  const [sheetName, setSheetName] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateSheet = async () => {
    setLoading(true);
    setLogMessage("");
    try {
      await axios.post(`http://localhost:5000/sheet/create`, { sheetName });
      setLogMessage(`Sheet "${sheetName}" created successfully!`);
      setSheetName(""); // Reset the form
    } catch (error) {
      console.error("Error creating sheet:", error);
      setLogMessage(`Failed to create sheet "${sheetName}".`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Create New Existing Class Name
      </Typography>
      <TextField
        label="Sheet Name"
        fullWidth
        margin="normal"
        value={sheetName}
        onChange={(e) => setSheetName(e.target.value)}
      />
      {logMessage && (
        <Alert severity={logMessage.includes("failed") ? "error" : "success"}>
          {logMessage}
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateSheet}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Sheet"}
      </Button>
    </Container>
  );
};

export default CreateSheet;
