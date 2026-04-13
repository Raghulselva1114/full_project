import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { motion } from "framer-motion";
import API from "../../api/axios";

export default function ProjectCards3D() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects/");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (project) => {
    window.open(
      "https://698d4ff12a66a700082da775--teamdstri.netlify.app/",
      "_blank",
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        background:
          "linear-gradient(135deg, #eef2f7 0%, #dbe7f5 50%, #f7fbff 100%)",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        mb={4}
        textAlign="center"
        sx={{
          background: "linear-gradient(90deg,#0f172a,#2563eb)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Project Dashboard
      </Typography>

      <Grid container spacing={4}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <motion.div
              whileHover={{ y: -10, rotateX: 4 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  borderRadius: "28px",
                  overflow: "hidden",
                  backdropFilter: "blur(14px)",
                  background: "rgba(255,255,255,0.75)",
                  boxShadow:
                    "0 20px 45px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  transformStyle: "preserve-3d",
                  transition: "all 0.35s ease",
                  "&:hover": {
                    boxShadow: "0 28px 55px rgba(37,99,235,0.22)",
                  },
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    textAlign="center"
                    sx={{ textTransform: "capitalize", color: "#0f172a" }}
                  >
                    {project.name}
                  </Typography>
                </CardContent>

                <CardMedia
                  component="img"
                  height="240"
                  image={project.image}
                  alt={project.name}
                  sx={{
                    px: 2,
                    borderRadius: "24px",
                    objectFit: "cover",
                  }}
                />

                <Box p={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleView(project)}
                    sx={{
                      py: 1.4,
                      fontWeight: 700,
                      borderRadius: "14px",
                      fontSize: "1rem",
                      textTransform: "none",
                      background:
                        "linear-gradient(135deg,#2563eb 0%,#1d4ed8 50%,#1e40af 100%)",
                      boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg,#1d4ed8 0%,#1e40af 100%)",
                      },
                    }}
                  >
                    View
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
