import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Visibility, VisibilityOff, ContentCopy } from "@mui/icons-material";
import API from "../../api/axios";
import Topbar from "../../layouts/Topbar";

export default function CreateOrganization() {
  const [form, setForm] = useState({
    organization_name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // 📋 Copy Credentials
  const copyCredentials = () => {
    navigator.clipboard.writeText(
      `Username: ${form.username}\nPassword: ${form.password}`,
    );
    alert("Copied ✅");
  };

  // 🚀 Create Organization + Admin
  const createOrg = async () => {
    if (!form.organization_name || !form.username || !form.password) {
      alert("All fields are required ❌");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    try {
      await API.post("create-admin/", {
        organization_name: form.organization_name,
        username: form.username,
        password: form.password,
      });

      setOpenDialog(true);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Something went wrong";

      alert(msg);
    }
  };

  return (
    <>
      <Topbar />

      <Box
        sx={{
          pt: 12,
          height: "70vh",
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          sx={{
            width: 420,
            borderRadius: 4,
            backdropFilter: "blur(15px)",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <CardContent>
            <Typography variant="h5" textAlign="center" mb={2}>
              🏢 Create Organization
            </Typography>

            {/* Organization */}
            <TextField
              fullWidth
              label="Organization Name"
              margin="normal"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{ input: { color: "#fff" } }}
              onChange={(e) =>
                setForm({ ...form, organization_name: e.target.value })
              }
            />

            {/* Username */}
            <TextField
              fullWidth
              label="Admin Username"
              margin="normal"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{ input: { color: "#fff" } }}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{ input: { color: "#fff" } }}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ color: "#fff" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password */}
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{ input: { color: "#fff" } }}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />

            {/* Create */}
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                background: "linear-gradient(45deg, #00c6ff, #0072ff)",
              }}
              onClick={createOrg}
            >
              Create Organization ✅
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* 🎉 Success Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>🎉 Organization Created!</DialogTitle>
        <DialogContent>
          <Typography>
            <b>Organization:</b> {form.organization_name}
          </Typography>
          <Typography>
            <b>Username:</b> {form.username}
          </Typography>
          <Typography>
            <b>Password:</b> {form.password}
          </Typography>

          <Button
            startIcon={<ContentCopy />}
            onClick={copyCredentials}
            sx={{ mt: 2 }}
          >
            Copy Credentials
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
