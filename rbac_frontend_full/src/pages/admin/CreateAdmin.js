import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, EyeOff, Copy, Building2 } from "lucide-react";
import API from "../../api/axios";
import Topbar from "../../layouts/Topbar";

export default function CreateOrganization() {
  const [form, setForm] = useState({
    organization_name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const copyCredentials = () => {
    navigator.clipboard.writeText(
      `Username: ${form.username}\nPassword: ${form.password}`,
    );
    alert("Copied ✅");
  };

  const createOrg = async () => {
    if (!form.organization_name || !form.username || !form.password) {
      alert("All fields are required ❌");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    try {
      await API.post("create-admin/", {
        organization_name: form.organization_name,
        username: form.username,
        password: form.password,
      });

      setOpenDialog(true);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Something went wrong";

      alert(msg);
    }
  };

  return (
    <>
      <Topbar />

      <div className="min-h-screen pt-24 px-4 flex justify-center items-center bg-slate-50">
        <Card className="w-full max-w-[470px] shadow-lg border-0 sm:border border-border">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Create Organization</h2>
            <p className="text-sm text-muted-foreground">Setup a new organization with admin credentials</p>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="organization_name">Organization Name</Label>
              <Input
                id="organization_name"
                value={form.organization_name}
                onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Admin Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <Button
              className="w-full mt-4 py-6 text-base"
              onClick={createOrg}
            >
              CREATE ORGANIZATION 🚀
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🎉 Organization Created Successfully!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="text-sm">
              <span className="font-semibold px-2">Organization:</span> 
              <span className="text-muted-foreground">{form.organization_name}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold px-2">Username:</span> 
              <span className="text-muted-foreground">{form.username}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold px-2">Password:</span> 
              <span className="text-muted-foreground">{form.password}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={copyCredentials}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
