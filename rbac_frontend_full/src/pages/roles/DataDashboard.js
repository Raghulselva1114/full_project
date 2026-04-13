import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardMedia, Typography, Button } from "@mui/material";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function ProjectCardsPreview() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await API.get("projects/");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Grid container spacing={4}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card
              sx={{
                p: 2,
                borderRadius: "18px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
                textAlign="center"
              >
                {project.project_name}
              </Typography>

              <CardMedia
                component="img"
                image={
                  project.image ||
                  "https://via.placeholder.com/400x250?text=No+Image"
                }
                alt={project.project_name}
                sx={{
                  height: 220,
                  borderRadius: "12px",
                  objectFit: "cover",
                  mb: 2,
                }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  navigate(`/project-details/${project.id}`, {
                    state: { projectName: project.project_name },
                  })
                }
              >
                Update Data
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
