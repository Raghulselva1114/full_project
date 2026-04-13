import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  Apartment,
  BusinessCenter,
  FolderOpen,
  Group,
  DashboardCustomize,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const SIDEBAR_WIDTH = 240;
  const TOPBAR_HEIGHT = 72;

  const role = localStorage.getItem("role");

  const menuItems = {
    superadmin: [
      {
        label: "Create Organization",
        path: "/superadmin",
        icon: <Apartment />,
      },
      {
        label: "Organization Management",
        path: "/organizations",
        icon: <BusinessCenter />,
      },
    ],

    admin: [
      {
        label: "Project Setup",
        path: "/admin/projects",
        icon: <FolderOpen />,
      },
      {
        label: "Project User",
        path: "/admin/project-user",
        icon: <Group />,
      },
      {
        label: "Project Management",
        path: "/admin/project-management",
        icon: <DashboardCustomize />,
      },
    ],
  };

  const currentMenu = menuItems[role] || [];

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        position: "fixed",
        left: 0,
        top: `${TOPBAR_HEIGHT}px`,
        overflowY: "auto",
        px: 2,
        py: 3,

        background: `
          linear-gradient(
            180deg,
            rgba(8,15,35,0.96),
            rgba(15,30,60,0.94)
          )
        `,
        backdropFilter: "blur(18px)",

        borderRight: "1px solid rgba(255,255,255,0.08)",

        boxShadow: `
          8px 0 30px rgba(0,0,0,0.35),
          inset -1px 0 0 rgba(255,255,255,0.04)
        `,
      }}
    >
      {/* MENU HEADER */}
      <Typography
        variant="caption"
        sx={{
          px: 1.5,
          mb: 3,
          display: "block",
          textTransform: "uppercase",
          letterSpacing: 2,
          fontWeight: 700,
          color: "#7dd3fc",
        }}
      >
        {role || "User"} Menu
      </Typography>

      {/* MENU ITEMS */}
      <List sx={{ p: 0 }}>
        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => {
                if (!isActive) navigate(item.path);
              }}
              sx={{
                mb: 1.5,
                px: 2,
                py: 1.6,
                borderRadius: "16px",
                position: "relative",
                overflow: "hidden",

                background: isActive
                  ? "linear-gradient(135deg,#00c6ff,#0072ff)"
                  : "rgba(255,255,255,0.03)",

                color: isActive ? "#fff" : "#dbe7f3",

                boxShadow: isActive
                  ? "0 10px 25px rgba(0,114,255,0.35)"
                  : "none",

                transition: "all 0.3s ease",

                "&:hover": {
                  transform: "translateX(8px) scale(1.02)",
                  background: isActive
                    ? "linear-gradient(135deg,#00b4ff,#0062ff)"
                    : "rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                },

                "&::before": isActive
                  ? {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: "4px",
                      borderRadius: "0 8px 8px 0",
                      background: "#fff",
                    }
                  : {},
              }}
            >
              <Box
                sx={{
                  mr: 2,
                  display: "flex",
                  alignItems: "center",
                  color: "inherit",
                }}
              >
                {item.icon}
              </Box>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
