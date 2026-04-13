import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Super Admin
import CreateAdmin from "./pages/admin/CreateAdmin";
import OrganizationManagement from "./pages/admin/OrganizationManagement";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import Projects from "./pages/admin/Projects";
import CreateProjectUser from "./pages/admin/CreateProjectUser";
import ProjectManagement from "./pages/admin/ProjectManagement";
import Users from "./pages/admin/Users";

// Member
import MemberDashboard from "./pages/member/Dashboard";
import CreateUser from "./pages/member/CreateUser";

// User
import UserDashboard from "./pages/user/Dashboard";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

//subroles
import ManagerDashboard from "./pages/roles/ManagerDashboard";
import EngineerDashboard from "./pages/roles/EngineerDashboard";
import DataDashboard from "./pages/roles/DataDashboard";

import ProjectDetailsPage from "./pages/roles/ProjectDetailsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 Public Routes (NO layout) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔐 Layout Wrapper */}
        <Route element={<DashboardLayout />}>
          {/* Super Admin */}
          <Route path="/superadmin" element={<CreateAdmin />} />
          <Route path="/superadmin/create-admin" element={<CreateAdmin />} />
          <Route path="/organizations" element={<OrganizationManagement />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/projects" element={<Projects />} />
          <Route path="/admin/project-user" element={<CreateProjectUser />} />
          <Route
            path="/admin/project-management"
            element={<ProjectManagement />}
          />
          <Route path="/admin/users" element={<Users />} />

          {/* Member */}
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/member/create-user" element={<CreateUser />} />

          {/* User */}
          <Route path="/user/dashboard" element={<UserDashboard />} />

          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/engineer" element={<EngineerDashboard />} />
          <Route path="/data" element={<DataDashboard />} />
          <Route path="/project-details/:id" element={<ProjectDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
