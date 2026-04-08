import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import API from "../../api/axios";

export default function CreateProjectUser() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    sub_role: "", // 🔥 added
  });

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleCreateUser = async () => {
    if (loading) return;

    // ✅ password check
    if (form.password !== form.confirmPassword) {
      return setSnackbar({
        open: true,
        message: "Passwords do not match ❌",
        severity: "error",
      });
    }

    // ✅ role check
    if (!form.sub_role) {
      return setSnackbar({
        open: true,
        message: "Please select role ⚠️",
        severity: "warning",
      });
    }

    try {
      setLoading(true);

      await API.post(
        "create-user-assign/", // 🔥 your new API
        {
          username: form.username,
          password: form.password,
          sub_role: form.sub_role, // 🔥 send role
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setSnackbar({
        open: true,
        message: "Created Successfully ✅",
        severity: "success",
      });

      setForm({
        username: "",
        password: "",
        confirmPassword: "",
        sub_role: "",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error ❌",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Card sx={{ p: 4, width: 400 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Create User
          </Typography>

          {/* Username */}
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={form.username}
            onChange={handleChange("username")}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={form.password}
            onChange={handleChange("password")}
          />

          {/* Confirm Password */}
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
          />

          {/* 🔥 Role Dropdown */}
          <TextField
            select
            fullWidth
            label="Select Role"
            margin="normal"
            value={form.sub_role}
            onChange={handleChange("sub_role")}
          >
            <MenuItem value="project_manager">Project Manager</MenuItem>
            <MenuItem value="project_engineer">Project Engineer</MenuItem>
            <MenuItem value="data_contributor">Data Contributor</MenuItem>
          </TextField>

          {/* Button */}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleCreateUser}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
