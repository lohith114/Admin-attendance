import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import StudentForm from "./StudentForm";
import UserSheet from "./UserSheet";
import ViewAttendance from "./ViewAttendance";
import ModifyStudent from "./ModifyStudent";
import ViewFullAttendance from "./ViewFullAttendance";
import CreateSheet from "./CreateSheet";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/student-form" element={<StudentForm />} />
        <Route path="/user-sheet" element={<UserSheet />} />
        <Route path="/view-attendance" element={<ViewAttendance />} />
        <Route path="/modify-student" element={<ModifyStudent />} />
        <Route path="/view-full-attendance" element={<ViewFullAttendance />} />
        <Route path="/create-sheet" element={<CreateSheet />} />
      </Routes>
    </Router>
  );
};

export default App;
