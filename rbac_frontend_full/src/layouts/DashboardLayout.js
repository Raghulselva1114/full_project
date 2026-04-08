import { Box } from "@mui/material";
import { useLocation, Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const location = useLocation();
  const SIDEBAR_WIDTH = 240;
  const TOPBAR_HEIGHT = 64;

  const sidebarRoutes = [
    "/superadmin",
    "/superadmin/create-admin",
    "/organizations",

    "/admin",
    "/admin/projects",
    "/admin/project-management",
    "/admin/project-user",
    "/admin/users",
  ];

  const showSidebar = sidebarRoutes.includes(location.pathname);

  return (
    <>
      <Topbar />

      {showSidebar && <Sidebar />}

      <Box
        sx={{
          ml: showSidebar ? `${SIDEBAR_WIDTH}px` : 0,
          pt: `calc(${TOPBAR_HEIGHT}px + 16px)`,
          px: 2,
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}
