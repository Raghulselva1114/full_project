import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const signup = async () => {
    if (!form.username || !form.password) {
      return alert("All fields required ❌");
    }

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match ❌");
    }

    try {
      await API.post("signup/", {
        username: form.username,
        password: form.password,
      });

      alert("SuperAdmin created ✅");
      navigate("/");
    } catch (err) {
      console.log("FULL ERROR:", err);

      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        err.message;

      alert(errorMsg);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #43cea2, #185a9d)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ width: 400, borderRadius: 4, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={2}>
            📝 Signup
          </Typography>

          <TextField
            fullWidth
            label="Username"
            margin="normal"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
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
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, borderRadius: 2, py: 1 }}
            onClick={signup}
          >
            Signup
          </Button>

          <Typography mt={2} textAlign="center">
            Already have an account?{" "}
            <span
              style={{
                color: "#43cea2",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/")}
            >
              Login
            </span>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
