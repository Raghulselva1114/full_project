import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const SIDEBAR_WIDTH = 240;
  const TOPBAR_HEIGHT = 64;

  // Get role from localStorage
  const role = localStorage.getItem("role");
  const menuItems = {
    superadmin: [
      { label: "Create Organization", path: "/superadmin" },
      { label: "Organization Management", path: "/organizations" },
    ],
    admin: [
      { label: "Project Setup", path: "/admin/projects" },
      { label: "Project User", path: "/admin/project-user" },
      { label: "Project Management", path: "/admin/project-management" },
    ],
  };
  const currentMenu = menuItems[role] || [];

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        background: "#152231",
        color: "#dbe7f3",
        position: "fixed",
        left: 0,
        top: `${TOPBAR_HEIGHT}px`,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        px: 1,
        py: 2,
        overflowY: "auto",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          px: 2,
          pb: 1,
          display: "block",
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "rgba(219,231,243,0.7)",
        }}
      >
        {role || "User"} Menu
      </Typography>

      <List>
        {currentMenu.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              if (location.pathname !== item.path) {
                navigate(item.path);
              }
            }}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                background: "linear-gradient(90deg, #1e88e5, #42a5f5)",
                color: "#fff",
              },
              "&.Mui-selected:hover": {
                background: "linear-gradient(90deg, #1976d2, #2196f3)",
              },
              "&:hover": {
                background: "rgba(255,255,255,0.08)",
              },
            }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
