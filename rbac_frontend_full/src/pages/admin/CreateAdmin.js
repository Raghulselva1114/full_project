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
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  Apartment,
} from "@mui/icons-material";
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

  const copyCredentials = () => {
    navigator.clipboard.writeText(
      `Username: ${form.username}\nPassword: ${form.password}`,
    );
    alert("Copied ✅");
  };

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

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(10px)",
      color: "#fff",
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.15)",
      },
      "&:hover fieldset": {
        borderColor: "#00c6ff",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00e5ff",
        boxShadow: "0 0 15px rgba(0,229,255,0.4)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.8)",
    },
    "& input": {
      color: "#fff",
    },
  };

  return (
    <>
      <Topbar />

      <Box
        sx={{
          minHeight: "100vh",
          pt: 12,
          px: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: `
            radial-gradient(circle at top left, rgba(0,198,255,0.18), transparent 30%),
            radial-gradient(circle at bottom right, rgba(0,114,255,0.18), transparent 35%),
            linear-gradient(135deg, #0f172a, #1e3a8a)
          `,
        }}
      >
        <Card
          sx={{
            width: 470,
            borderRadius: "28px",
            overflow: "hidden",
            backdropFilter: "blur(22px)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: `
              0 20px 60px rgba(0,0,0,0.45),
              inset 0 1px 0 rgba(255,255,255,0.08)
            `,
            position: "relative",
          }}
        >
          <Box
            sx={{
              height: 6,
              background: "linear-gradient(90deg,#00e5ff,#0072ff,#7c3aed)",
            }}
          />

          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Apartment
                sx={{
                  fontSize: 44,
                  color: "#00e5ff",
                  filter: "drop-shadow(0 0 12px rgba(0,229,255,0.6))",
                }}
              />

              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  mt: 1,
                  background: "linear-gradient(45deg,#ffffff,#cbd5e1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Create Organization
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.65)", mt: 1 }}
              >
                Setup a new organization with admin credentials
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Organization Name"
              margin="normal"
              sx={inputStyle}
              onChange={(e) =>
                setForm({ ...form, organization_name: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="Admin Username"
              margin="normal"
              sx={inputStyle}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              sx={inputStyle}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ color: "#00e5ff" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              sx={inputStyle}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
            />

            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 4,
                py: 1.6,
                fontWeight: "bold",
                fontSize: "1rem",
                borderRadius: "14px",
                background: "linear-gradient(135deg,#00c6ff,#0072ff)",
                boxShadow: "0 10px 30px rgba(0,114,255,0.45)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 14px 35px rgba(0,114,255,0.6)",
                },
              }}
              onClick={createOrg}
            >
              CREATE ORGANIZATION 🚀
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: "linear-gradient(135deg,#0f172a,#1e293b)",
            color: "#fff",
            minWidth: 400,
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <DialogTitle>🎉 Organization Created Successfully!</DialogTitle>

        <DialogContent>
          <Typography mb={1}>
            <b>Organization:</b> {form.organization_name}
          </Typography>
          <Typography mb={1}>
            <b>Username:</b> {form.username}
          </Typography>
          <Typography mb={2}>
            <b>Password:</b> {form.password}
          </Typography>

          <Button
            fullWidth
            startIcon={<ContentCopy />}
            onClick={copyCredentials}
            sx={{
              background: "linear-gradient(135deg,#00c6ff,#0072ff)",
              color: "#fff",
              borderRadius: "12px",
              "&:hover": {
                background: "linear-gradient(135deg,#00b4ff,#005eff)",
              },
            }}
          >
            Copy Credentials
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
