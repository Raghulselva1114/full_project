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
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Login() {
  const [form, setForm] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await API.post("custom-login/", {
        username: form.username,
        password: form.password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ store token
      localStorage.setItem("token", res.data.access);

      // ✅ role only
      const role = (res.data.sub_role || res.data.role)?.toLowerCase();

      console.log("ROLE:", role);

      localStorage.setItem("role", role);

      // 🔥 ROLE BASED REDIRECT (FINAL)
      const roleRoutes = {
        superadmin: "/superadmin",
        admin: "/admin/projects",
        member: "/member/dashboard",

        // 👇 your required dashboards
        project_manager: "/manager",
        project_engineer: "/engineer",
        data_contributor: "/data",
      };

      if (!roleRoutes[role]) {
        alert("Unauthorized role ❌");
        return;
      }

      // special check for superadmin
      if (role === "superadmin") {
        const check = await API.get("check-admin/");

        if (!check.data.admin_exists) {
          navigate("/superadmin/create-admin");
        } else {
          navigate("/superadmin");
        }
        return;
      }

      // ✅ navigate based on role
      navigate(roleRoutes[role]);
    } catch (err) {
      console.log("ERROR:", err.response?.data);

      alert(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          JSON.stringify(err.response?.data) ||
          "Login failed ❌",
      );
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ width: 380, borderRadius: 4, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={2}>
            🔐 Login
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

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, borderRadius: 2, py: 1 }}
            onClick={login}
          >
            Login
          </Button>

          <Typography mt={2} textAlign="center">
            Don't have an account?{" "}
            <span
              style={{
                color: "#667eea",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/signup")}
            >
              Signup
            </span>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
