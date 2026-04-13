import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EditIcon from "@mui/icons-material/Edit";
import { useLocation, useParams } from "react-router-dom";
import API from "../../api/axios";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const location = useLocation();

  const projectName = location.state?.projectName || "Selected Project";

  const [bimRows, setBimRows] = useState([]);
  const [pointRows, setPointRows] = useState([]);

  useEffect(() => {
    fetchSavedData();
  }, [id]);

  const fetchSavedData = async () => {
    try {
      const bimRes = await API.get(`projects/${id}/bim/`);
      const pointRes = await API.get(`projects/${id}/pointcloud/`);

      setBimRows(
        bimRes.data.map((row) => ({
          ...row,
          editable: false,
          isNew: false,
        })),
      );

      setPointRows(
        pointRes.data.map((row) => ({
          ...row,
          editable: false,
          isNew: false,
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const addRow = (type) => {
    const row = {
      id: Date.now(),
      description: "",
      file: null,
      date: "",
      editable: true,
      isNew: true,
    };

    if (type === "bim") setBimRows((prev) => [...prev, row]);
    else setPointRows((prev) => [...prev, row]);
  };

  const updateRow = (type, rowId, field, value) => {
    const updater = (rows) =>
      rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r));

    if (type === "bim") setBimRows(updater);
    else setPointRows(updater);
  };

  const toggleEdit = (type, rowId) => {
    const updater = (rows) =>
      rows.map((r) => (r.id === rowId ? { ...r, editable: !r.editable } : r));

    if (type === "bim") setBimRows(updater);
    else setPointRows(updater);
  };

  const saveRow = async (type, row) => {
    try {
      const formData = new FormData();
      formData.append("description", row.description);
      formData.append("date", row.date);

      if (row.file instanceof File) {
        formData.append("file", row.file);
      }

      let url = "";
      let method = "post";

      if (row.isNew) {
        url =
          type === "bim" ? `projects/${id}/bim/` : `projects/${id}/pointcloud/`;
      } else {
        url =
          type === "bim"
            ? `bim/${row.id}/update/`
            : `pointcloud/${row.id}/update/`;
        method = "put";
      }

      const res = await API({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const savedRow = {
        ...res.data,
        editable: false,
        isNew: false,
      };

      if (type === "bim") {
        setBimRows((prev) => prev.map((r) => (r.id === row.id ? savedRow : r)));
      } else {
        setPointRows((prev) =>
          prev.map((r) => (r.id === row.id ? savedRow : r)),
        );
      }

      alert("Saved Successfully ✅");
    } catch (err) {
      console.error(err.response?.data);
      alert(JSON.stringify(err.response?.data));
    }
  };

  const deleteRow = async (type, rowId) => {
    try {
      if (String(rowId).length < 10) {
        const url =
          type === "bim"
            ? `bim/${rowId}/delete/`
            : `pointcloud/${rowId}/delete/`;

        await API.delete(url);
      }

      if (type === "bim") {
        setBimRows((prev) => prev.filter((r) => r.id !== rowId));
      } else {
        setPointRows((prev) => prev.filter((r) => r.id !== rowId));
      }
    } catch (err) {
      console.error(err);
      alert("Delete Failed");
    }
  };

  const renderRows = (rows, type) =>
    rows.map((row, i) => (
      <Paper
        key={row.id}
        component={motion.div}
        whileHover={{ scale: 1.015 }}
        sx={{
          p: 2.5,
          mb: 2.5,
          borderRadius: "24px",
          background: "linear-gradient(145deg,#ffffff,#edf4ff)",
          boxShadow:
            "8px 8px 20px rgba(0,0,0,0.08), -6px -6px 18px rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.65)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          <Typography
            sx={{
              minWidth: 35,
              fontWeight: 700,
              color: "#1976d2",
              fontSize: "18px",
            }}
          >
            {i + 1}
          </Typography>

          <TextField
            fullWidth
            disabled={!row.editable}
            value={row.description}
            onChange={(e) =>
              updateRow(type, row.id, "description", e.target.value)
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
                background: "#fff",
              },
            }}
          />

          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            disabled={!row.editable}
            sx={{
              borderRadius: "16px",
              px: 2.5,
              py: 1.4,
              minWidth: 210,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {row.file
              ? typeof row.file === "string"
                ? row.file.split("/").pop()
                : row.file.name
              : "Upload File"}

            <input
              hidden
              type="file"
              accept={
                type === "bim"
                  ? ".rvt,.ifc,.dwg,.nwd,.nwc"
                  : ".e57,.las,.laz,.pts,.xyz,.ply"
              }
              onChange={(e) =>
                updateRow(type, row.id, "file", e.target.files[0])
              }
            />
          </Button>

          <TextField
            type="date"
            disabled={!row.editable}
            value={row.date}
            onChange={(e) => updateRow(type, row.id, "date", e.target.value)}
            sx={{
              width: 180,
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
                background: "#fff",
              },
            }}
          />

          <IconButton
            onClick={() => saveRow(type, row)}
            sx={{
              background: "#1976d2",
              color: "#fff",
              width: 50,
              height: 50,
              "&:hover": { background: "#125bb5" },
            }}
          >
            <SaveIcon />
          </IconButton>

          <IconButton
            onClick={() => toggleEdit(type, row.id)}
            sx={{
              background: "#ff9800",
              color: "#fff",
              width: 50,
              height: 50,
              "&:hover": { background: "#f57c00" },
            }}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            onClick={() => deleteRow(type, row.id)}
            sx={{
              background: "#ef5350",
              color: "#fff",
              width: 50,
              height: 50,
              "&:hover": { background: "#d32f2f" },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Paper>
    ));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        background: "linear-gradient(135deg,#f5f8ff,#eaf2ff)",
      }}
    >
      <Card
        sx={{
          p: 4,
          mb: 4,
          borderRadius: "30px",
          background: "linear-gradient(135deg,#1976d2,#42a5f5)",
          color: "#fff",
          boxShadow: "0 15px 40px rgba(25,118,210,0.35)",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          {projectName}
        </Typography>
        <Typography mt={1}>
          Manage BIM and Point Cloud Data for this project
        </Typography>
      </Card>

      <Card
        sx={{
          p: 3,
          mb: 4,
          borderRadius: "28px",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            BIM Data
          </Typography>

          <Button
            variant="contained"
            onClick={() => addRow("bim")}
            sx={{ borderRadius: "14px" }}
          >
            Add BIM File
          </Button>
        </Stack>

        {renderRows(bimRows, "bim")}
      </Card>

      <Card
        sx={{
          p: 3,
          borderRadius: "28px",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Point Cloud Data
          </Typography>

          <Button
            variant="contained"
            onClick={() => addRow("point")}
            sx={{ borderRadius: "14px" }}
          >
            Add Point Cloud
          </Button>
        </Stack>

        {renderRows(pointRows, "point")}
      </Card>
    </Box>
  );
}
