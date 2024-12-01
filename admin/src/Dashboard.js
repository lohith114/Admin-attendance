import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box, Paper } from "@mui/material";
import { styled } from "@mui/system";

const Dashboard = () => {
  const navigate = useNavigate();

  const CustomButton = styled(Button)({
    "&:hover": {
      transform: "scale(1.05)",
      transition: "transform 0.2s",
    },
  });

  return (
    <Container className="dashboard-container">
      <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          className="button-container"
        >
          <CustomButton
            variant="contained"
            color="primary"
            onClick={() => navigate("/student-form")}
          >
            Go to Student Registration
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            onClick={() => navigate("/user-sheet")}
          >
            Go to Class Teacher Login Details
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            onClick={() => navigate("/view-attendance")}
          >
            View Attendance Class Wise
          </CustomButton>
          <CustomButton
            variant="contained"
            color="secondary"
            onClick={() => navigate("/modify-student")}
          >
            Modify Student Information
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            onClick={() => navigate("/view-full-attendance")}
          >
            View Full Attendance Data/Delete
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            onClick={() => navigate("/create-sheet")}
          >
            Create New Existing Class Name
          </CustomButton>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;
