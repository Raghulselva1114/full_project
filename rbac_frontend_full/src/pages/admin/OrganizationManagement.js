import { useEffect, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Trash2 } from "lucide-react";
import API from "../../api/axios";

export default function OrganizationManagement() {
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState("");

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

  const deleteOrg = async (id) => {
    if (!window.confirm("Delete this organization?")) return;

    await API.delete(`organizations/${id}/`);
    fetchOrgs();
  };

  const handleEdit = (org) => {
    setSelectedOrg(org);
    setNewName(org.organization_name);
    setOpen(true);
  };

  const updateOrg = async () => {
    await API.put(`organizations/${selectedOrg.id}/update/`, {
      organization_name: newName,
    });

    setOpen(false);
    fetchOrgs();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Organization Management</h2>
      </div>

      <Input
        placeholder="Search..."
        className="max-w-md"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Organization</TableHead>
              <TableHead className="font-bold">User</TableHead>
              <TableHead className="font-bold">Joined Date</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orgs
              .filter((o) =>
                o.organization_name
                  ?.toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.organization_name}</TableCell>
                  <TableCell>{org.username}</TableCell>
                  <TableCell>
                    {org.created_at
                      ? new Date(org.created_at).toLocaleDateString()
                      : "-"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(org)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => deleteOrg(org.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {orgs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={updateOrg}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
