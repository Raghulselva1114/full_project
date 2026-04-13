import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import API from "../../api/axios";

export default function ProjectSetup() {
  const [projectForm, setProjectForm] = useState({
    projectName: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [loadingProject, setLoadingProject] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 🔹 HANDLERS
  const handleProjectChange = (field) => (e) => {
    setProjectForm({ ...projectForm, [field]: e.target.value });
  };

  // 🚀 CREATE PROJECT
  const handleCreateProject = async () => {
    if (loadingProject) return;

    if (!projectForm.projectName) {
      setSnackbar({
        open: true,
        message: "Project name is required ❌",
        severity: "error",
      });
      return;
    }

    try {
      setLoadingProject(true);

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

      setSnackbar({
        open: true,
        message: "Project Created Successfully ✅",
        severity: "success",
      });

      setProjectForm({
        projectName: "",
        description: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Error creating project ❌",
        severity: "error",
      });
    } finally {
      setLoadingProject(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e3f2fd, #ffffff)",
        p: 2,
      }}
    >
      <Grid container spacing={3} maxWidth={500}>
        {/* CREATE PROJECT */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" mb={2} fontWeight="bold">
                Create Project
              </Typography>

              <TextField
                fullWidth
                label="Project Name"
                margin="normal"
                value={projectForm.projectName}
                onChange={handleProjectChange("projectName")}
              />

              <TextField
                fullWidth
                label="Description"
                margin="normal"
                value={projectForm.description}
                onChange={handleProjectChange("description")}
              />

              <TextField
                fullWidth
                label="Start Date"
                type="date"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={projectForm.startDate}
                onChange={handleProjectChange("startDate")}
              />

              <TextField
                fullWidth
                label="End Date"
                type="date"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={projectForm.endDate}
                onChange={handleProjectChange("endDate")}
              />

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2, borderRadius: 5 }}
                onClick={handleCreateProject}
                disabled={loadingProject}
              >
                {loadingProject ? "Creating..." : "Create Project"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🔥 SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
