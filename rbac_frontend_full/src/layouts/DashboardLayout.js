import { useLocation, Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const location = useLocation();

  const sidebarRoutes = [
    "/superadmin",
    "/superadmin/create-admin",
    "/organizations",
    "/profile",

    "/admin",
    "/admin/projects",
    "/admin/project-management",
    "/admin/project-user",
    "/admin/users",
    "/manager",
    "/engineer",
    "/data",
  ];

  const showSidebar = sidebarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />

      {showSidebar && <Sidebar />}

      <main 
        className={`pt-20 px-6 pb-6 transition-all duration-300 ${
          showSidebar ? "ml-60" : "ml-0"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
