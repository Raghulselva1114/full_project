import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  Briefcase,
  FolderOpen,
  Users,
  LayoutDashboard,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");

  const menuItems = {
    superadmin: [
      {
        label: "Profile",
        path: "/profile",
        icon: <UserCircle2 className="w-5 h-5" />,
      },
      {
        label: "Create Organization",
        path: "/superadmin",
        icon: <Building2 className="w-5 h-5" />,
      },
      {
        label: "Organization Management",
        path: "/organizations",
        icon: <Briefcase className="w-5 h-5" />,
      },
    ],

    admin: [
      {
        label: "Profile",
        path: "/profile",
        icon: <UserCircle2 className="w-5 h-5" />,
      },
      {
        label: "Project Setup",
        path: "/admin/projects",
        icon: <FolderOpen className="w-5 h-5" />,
      },
      {
        label: "Project User",
        path: "/admin/project-user",
        icon: <Users className="w-5 h-5" />,
      },
      {
        label: "Project Management",
        path: "/admin/project-management",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ],
    project_manager: [
      {
        label: "Profile",
        path: "/profile",
        icon: <UserCircle2 className="w-5 h-5" />,
      },
      {
        label: "Dashboard",
        path: "/manager",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ],
    project_engineer: [
      {
        label: "Profile",
        path: "/profile",
        icon: <UserCircle2 className="w-5 h-5" />,
      },
      {
        label: "Dashboard",
        path: "/engineer",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ],
    data_contributor: [
      {
        label: "Profile",
        path: "/profile",
        icon: <UserCircle2 className="w-5 h-5" />,
      },
      {
        label: "Dashboard",
        path: "/data",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ],
  };

  const currentMenu = menuItems[role] || [];

  return (
    <aside className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-background border-r overflow-y-auto px-4 py-6 z-40 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
          {role || "User"} Menu
        </p>
      </div>

      <nav className="space-y-1">
        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => {
                if (!isActive) navigate(item.path);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
