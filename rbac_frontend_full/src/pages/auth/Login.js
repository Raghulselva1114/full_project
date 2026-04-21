import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

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

      localStorage.setItem("token", res.data.access);

      const role = (res.data.sub_role || res.data.role)?.toLowerCase();

      console.log("ROLE:", role);

      localStorage.setItem("role", role);

      const roleRoutes = {
        superadmin: "/superadmin",
        admin: "/admin/projects",
        member: "/member/dashboard",
        project_manager: "/manager",
        project_engineer: "/engineer",
        data_contributor: "/data",
      };

      if (!roleRoutes[role]) {
        alert("Unauthorized role ❌");
        return;
      }

      if (role === "superadmin") {
        const check = await API.get("check-admin/");

        if (!check.data.admin_exists) {
          navigate("/superadmin/create-admin");
        } else {
          navigate("/superadmin");
        }
        return;
      }

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm shadow-lg border-0">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold text-center mb-6">🔐 Login</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={login}
            >
              Login
            </Button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => navigate("/signup")}
              >
                Signup
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
