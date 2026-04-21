import { useState } from "react";
import API from "../../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProjectSetup() {
  const [projectForm, setProjectForm] = useState({
    projectName: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [loadingProject, setLoadingProject] = useState(false);
  const [message, setMessage] = useState(null);

  const handleProjectChange = (field) => (e) => {
    setProjectForm({ ...projectForm, [field]: e.target.value });
  };

  const handleCreateProject = async () => {
    if (loadingProject) return;

    if (!projectForm.projectName) {
      setMessage({ type: "error", text: "Project name is required ❌" });
      return;
    }

    if (!projectForm.startDate || !projectForm.endDate) {
      setMessage({ type: "warning", text: "Start Date and End Date are required ⚠️" });
      return;
    }

    try {
      setLoadingProject(true);
      setMessage(null);

      await API.post(
        "create-project/",
        {
          project_name: projectForm.projectName,
          description: projectForm.description,
          start_date: projectForm.startDate,
          end_date: projectForm.endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setMessage({ type: "success", text: "Project Created Successfully ✅" });

      setProjectForm({
        projectName: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Error creating project ❌",
      });
    } finally {
      setLoadingProject(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      <Card className="shadow-md border-0 sm:border sm:border-border">
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div
              className={`mb-4 px-4 py-3 rounded-md text-sm font-medium ${
                message.type === "error"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectForm.projectName}
                onChange={handleProjectChange("projectName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={projectForm.description}
                onChange={handleProjectChange("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={projectForm.startDate}
                onChange={handleProjectChange("startDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={projectForm.endDate}
                onChange={handleProjectChange("endDate")}
              />
            </div>

            <Button
              className="w-full mt-2"
              onClick={handleCreateProject}
              disabled={loadingProject}
            >
              {loadingProject ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
