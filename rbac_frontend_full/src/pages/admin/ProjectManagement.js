import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
  MenuItem,
  Avatar,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import API from "../../api/axios";

export default function ProjectManagement() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  const fetchProjects = async () => {
    const res = await API.get("projects/");
    setData(res.data);
  };

  const fetchUsers = async () => {
    const res = await API.get("users/");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleImageUpload = async (event, projectId) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    await API.patch(`projects/${projectId}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    fetchProjects();
  };

  const updateProject = async () => {
    try {
      await API.put(`projects/${editData.id}/`, {
        project_name: editData.project_name?.trim(),
      });

      setEditOpen(false);
      fetchProjects();

      alert("Project updated successfully ✅");
    } catch (err) {
      console.error("UPDATE ERROR:", err.response?.data || err);
      alert("Project update failed");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete project?")) return;

    await API.delete(`projects/${id}/delete/`);
    fetchProjects();
  };

  const assignUserToProject = async () => {
    await API.post("assign-user/", {
      project_id: selectedProject.id,
      user_ids: selectedUsers.map((u) => u.id),
    });

    setAssignOpen(false);
    setSelectedUsers([]);
    fetchProjects();
  };

  const removeUserFromProject = async (projectId, userId) => {
    await API.post("remove-user/", {
      project_id: projectId,
      user_id: userId,
    });

    fetchProjects();
  };

  const updateUserRole = async () => {
    await API.put(`update-user-role/${selectedUser.id}/`, {
      sub_role: newRole,
    });

    setRoleOpen(false);
    fetchProjects();
  };

  return (
    <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ width: "100%", maxWidth: 1300, p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Project Management
        </Typography>

        <TextField
          fullWidth
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Image</b>
              </TableCell>
              <TableCell>
                <b>Project</b>
              </TableCell>
              <TableCell>
                <b>Users</b>
              </TableCell>
              <TableCell>
                <b>Description</b>
              </TableCell>
              <TableCell>
                <b>Start</b>
              </TableCell>
              <TableCell>
                <b>End</b>
              </TableCell>
              <TableCell>
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data
              .filter((d) =>
                d.project_name?.toLowerCase().includes(search.toLowerCase()),
              )
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ width: 100 }}>
                    <Box
                      component="label"
                      sx={{
                        cursor: "pointer",
                        display: "inline-flex",
                        width: 60,
                        height: 60,
                        overflow: "hidden",
                      }}
                    >
                      <Avatar
                        src={row.image || ""}
                        variant="rounded"
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          bgcolor: "#f0f0f0",
                          border: "2px dashed #ccc",
                          pointerEvents: "none",
                        }}
                      >
                        {!row.image && "+"}
                      </Avatar>

                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, row.id)}
                      />
                    </Box>
                  </TableCell>

                  <TableCell>{row.project_name}</TableCell>

                  <TableCell>
                    {row.users?.length > 0
                      ? row.users.map((u) => (
                          <Chip
                            key={u.id}
                            label={u.username}
                            onClick={() => {
                              setSelectedUser(u);
                              setNewRole(u.sub_role || "");
                              setRoleOpen(true);
                            }}
                            onDelete={() => {
                              if (window.confirm("Remove user?")) {
                                removeUserFromProject(row.id, u.id);
                              }
                            }}
                            sx={{ mr: 1, mb: 1, cursor: "pointer" }}
                          />
                        ))
                      : "-"}
                  </TableCell>

                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.start}</TableCell>
                  <TableCell>{row.end}</TableCell>

                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setEditData(row);
                        setEditOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton
                      onClick={() => {
                        setSelectedProject(row);
                        setAssignOpen(true);
                      }}
                      sx={{ color: "#2e7d32" }}
                    >
                      ➕
                    </IconButton>

                    <IconButton onClick={() => deleteProject(row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* EDIT MODAL */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Project Name"
              value={editData?.project_name || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  project_name: e.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={updateProject}>Update</Button>
          </DialogActions>
        </Dialog>

        {/* ASSIGN USER MODAL */}
        <Dialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          fullWidth
        >
          <DialogTitle>Assign Users</DialogTitle>
          <DialogContent>
            <Typography mb={2}>
              Project: <b>{selectedProject?.project_name}</b>
            </Typography>

            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) =>
                `${option.username} - ${option.sub_role || "No Role"}`
              }
              value={selectedUsers}
              onChange={(e, val) => setSelectedUsers(val)}
              renderInput={(params) => (
                <TextField {...params} label="Select Users" />
              )}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={assignUserToProject}>Assign</Button>
          </DialogActions>
        </Dialog>

        {/* ROLE MODAL */}
        <Dialog open={roleOpen} onClose={() => setRoleOpen(false)} fullWidth>
          <DialogTitle>Change Role</DialogTitle>
          <DialogContent>
            <Typography mb={2}>
              User: <b>{selectedUser?.username}</b>
            </Typography>

            <TextField
              select
              fullWidth
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="project_manager">Project Manager</MenuItem>
              <MenuItem value="project_engineer">Project Engineer</MenuItem>
              <MenuItem value="data_contributor">Data Contributor</MenuItem>
            </TextField>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setRoleOpen(false)}>Cancel</Button>
            <Button onClick={updateUserRole}>Update</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
