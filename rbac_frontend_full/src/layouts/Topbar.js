import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role")?.toUpperCase();

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true }); // 🔥 better
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%", // 🔥 FULL WIDTH
        left: 0, // 🔥 RESET POSITION
        background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)", // 🔥 3D look
        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* LEFT */}
        <Typography fontWeight="bold" sx={{ letterSpacing: 1 }}>
          🚀 DSTRI ({role})
        </Typography>

        {/* RIGHT */}
        <Box>
          <Button
            color="inherit"
            onClick={logout}
            sx={{
              border: "1px solid white",
              borderRadius: 2,
              px: 2,
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
