import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role")?.toUpperCase();

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-background border-b z-50 shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center space-x-2">
        <h1 className="font-bold text-lg tracking-wide text-foreground">
          🚀 DSTRI ({role})
        </h1>
      </div>

      <div>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
