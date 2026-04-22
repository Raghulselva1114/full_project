import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit, Trash2, UserPlus, X } from "lucide-react";
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

  const navigate = useNavigate();

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
      user_ids: selectedUsers,
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

  const handleUserSelect = (e) => {
    const options = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setSelectedUsers(options);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Project Management
        </h2>
      </div>

      <Input
        placeholder="Search..."
        className="max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Image</TableHead>
              <TableHead className="font-bold">Project</TableHead>
              <TableHead className="font-bold">Users</TableHead>
              <TableHead className="font-bold">Description</TableHead>
              <TableHead className="font-bold">Start</TableHead>
              <TableHead className="font-bold">End</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data
              .filter((d) =>
                d.project_name?.toLowerCase().includes(search.toLowerCase()),
              )
              .map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => navigate(`/viewer/${row.id}`)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer inline-flex items-center justify-center w-12 h-12 rounded-md bg-muted border-2 border-dashed border-muted-foreground/25 overflow-hidden"
                    >
                      {row.image ? (
                        <img
                          src={row.image}
                          alt={row.project_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground">+</span>
                      )}
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, row.id)}
                      />
                    </label>
                  </TableCell>

                  <TableCell className="font-medium">
                    {row.project_name}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.users?.length > 0 ? (
                        row.users.map((u) => (
                          <div
                            key={u.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(u);
                              setNewRole(u.sub_role || "");
                              setRoleOpen(true);
                            }}
                            className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-secondary/80"
                          >
                            <span>{u.username}</span>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Remove user?")) {
                                  removeUserFromProject(row.id, u.id);
                                }
                              }}
                              className="ml-1 rounded-full hover:bg-secondary-foreground/20 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[150px] truncate">
                    {row.description}
                  </TableCell>
                  <TableCell>{row.start}</TableCell>
                  <TableCell>{row.end}</TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditData(row);
                        setEditOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(row);
                        setAssignOpen(true);
                      }}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(row.id);
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={editData?.project_name || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    project_name: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateProject}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ASSIGN USER MODAL */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Users</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm">
              Project:{" "}
              <span className="font-bold">{selectedProject?.project_name}</span>
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Users (Hold Ctrl/Cmd to select multiple)
              </label>
              <select
                multiple
                value={selectedUsers}
                onChange={handleUserSelect}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[150px]"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="py-1">
                    {user.username} - {user.sub_role || "No Role"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={assignUserToProject}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ROLE MODAL */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm">
              User: <span className="font-bold">{selectedUser?.username}</span>
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="project_manager">Project Manager</option>
                <option value="project_engineer">Project Engineer</option>
                <option value="data_contributor">Data Contributor</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateUserRole}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
