import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Alert, Box } from '@mui/material';


const UserSheet = () => {
  const [users, setUsers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    Username: "",
    Password: "",
  });
  const [logMessage, setLogMessage] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getUsers");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData({
      Username: users[index][0],
      Password: users[index][1],
    });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post("http://localhost:5000/updateUser", {
        CurrentUsername: users[editIndex][0],
        NewUsername: formData.Username,
        CurrentPassword: users[editIndex][1],
        NewPassword: formData.Password,
      });
      console.log("Backend response:", response.data.message);
      setLogMessage("User info updated successfully!");
      fetchUserData(); // Refresh the user data
      setEditIndex(null);
      setFormData({
        Username: "",
        Password: "",
      });
    } catch (error) {
      console.error("Error updating user info:", error);
      setLogMessage("Failed to update user info.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <Container className="user-sheet-container">
      <Typography variant="h4" gutterBottom>
        Teachers Login Details
      </Typography>
      {logMessage && <Alert severity={logMessage.includes('failed') ? 'error' : 'success'}>{logMessage}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Password</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user[0]}</TableCell>
                <TableCell>{user[1]}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="primary" onClick={() => handleEdit(index)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {editIndex !== null && (
        <Box className="edit-form" mt={3}>
          <Typography variant="h5" gutterBottom>
            Edit User
          </Typography>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <TextField
              label="Username"
              name="Username"
              value={formData.Username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              placeholder="Enter new username"
            />
            <TextField
              label="Password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              placeholder="Enter new password"
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </Box>
          </form>
        </Box>
      )}
    </Container>
  );
};

export default UserSheet;
