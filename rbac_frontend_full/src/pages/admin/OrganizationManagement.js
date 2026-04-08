import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import API from "../../api/axios";

export default function OrganizationManagement() {
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState("");

  // 🔥 popup state
  const [open, setOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [newName, setNewName] = useState("");

  const fetchOrgs = async () => {
    const res = await API.get("organizations/");
    setOrgs(res.data);
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  // ❌ DELETE
  const deleteOrg = async (id) => {
    if (!window.confirm("Delete this organization?")) return;

    await API.delete(`organizations/${id}/`);
    fetchOrgs();
  };

  // ✏️ OPEN EDIT
  const handleEdit = (org) => {
    setSelectedOrg(org);
    setNewName(org.organization_name);
    setOpen(true);
  };

  // 💾 SAVE EDIT
  const updateOrg = async () => {
    await API.put(`organizations/${selectedOrg.id}/update/`, {
      organization_name: newName,
    });

    setOpen(false);
    fetchOrgs();
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Organization Management</Typography>
      </Box>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search..."
        sx={{ mb: 3 }}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Organization</b>
              </TableCell>
              <TableCell>
                <b>User</b>
              </TableCell>
              <TableCell>
                <b>Joined Date</b>
              </TableCell>
              <TableCell>
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orgs
              .filter((o) =>
                o.organization_name
                  ?.toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.organization_name}</TableCell>
                  <TableCell>{org.username}</TableCell>
                  <TableCell>
                    {org.created_at
                      ? new Date(org.created_at).toLocaleDateString()
                      : "-"}
                  </TableCell>

                  <TableCell>
                    <IconButton onClick={() => handleEdit(org)}>
                      <Edit />
                    </IconButton>

                    <IconButton onClick={() => deleteOrg(org.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      {/* 🔥 EDIT POPUP */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Organization</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={updateOrg}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
