import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Save, Upload, Edit2 } from "lucide-react";
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
      <div
        key={row.id}
        className="flex flex-col md:flex-row gap-4 items-center p-4 mb-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all"
      >
        <div className="font-bold text-primary text-lg w-8 text-center bg-primary/10 rounded-full h-8 flex items-center justify-center shrink-0">
          {i + 1}
        </div>

        <Input
          className="flex-1"
          disabled={!row.editable}
          value={row.description}
          onChange={(e) =>
            updateRow(type, row.id, "description", e.target.value)
          }
          placeholder="Description"
        />

        <div className="flex-1 relative min-w-[200px]">
          <Button
            variant="outline"
            className="w-full justify-start whitespace-nowrap overflow-hidden text-ellipsis px-4"
            disabled={!row.editable}
            asChild
          >
            <label className="cursor-pointer font-normal flex items-center">
              <Upload className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {row.file
                  ? typeof row.file === "string"
                    ? row.file.split("/").pop()
                    : row.file.name
                  : "Upload File"}
              </span>
              <input
                className="hidden"
                type="file"
                disabled={!row.editable}
                accept={
                  type === "bim"
                    ? ".rvt,.ifc,.dwg,.nwd,.nwc"
                    : ".e57,.las,.laz,.pts,.xyz,.ply"
                }
                onChange={(e) =>
                  updateRow(type, row.id, "file", e.target.files[0])
                }
              />
            </label>
          </Button>
        </div>

        <Input
          className="w-full md:w-40 shrink-0"
          type="date"
          disabled={!row.editable}
          value={row.date}
          onChange={(e) => updateRow(type, row.id, "date", e.target.value)}
        />

        <div className="flex gap-2 shrink-0">
          <Button
            size="icon"
            onClick={() => saveRow(type, row)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            title="Save"
          >
            <Save className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => toggleEdit(type, row.id)}
            className="border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="destructive"
            onClick={() => deleteRow(type, row.id)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      <Card className="border-0 shadow-md bg-gradient-to-r from-blue-600 to-blue-400 text-primary-foreground">
        <CardContent className="p-6">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
            {projectName}
          </h2>
          <p className="opacity-90 text-blue-50">
            Manage BIM and Point Cloud Data for this project
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 rounded-t-xl border-b mb-4">
          <CardTitle>BIM Data</CardTitle>
          <Button onClick={() => addRow("bim")}>Add BIM File</Button>
        </CardHeader>
        <CardContent className="pt-2">
          {bimRows.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-xl">No BIM data available. Click "Add BIM File" to create one.</div>
          ) : (
            renderRows(bimRows, "bim")
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 rounded-t-xl border-b mb-4">
          <CardTitle>Point Cloud Data</CardTitle>
          <Button onClick={() => addRow("point")}>Add Point Cloud</Button>
        </CardHeader>
        <CardContent className="pt-2">
          {pointRows.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-xl">No Point Cloud data available. Click "Add Point Cloud" to create one.</div>
          ) : (
            renderRows(pointRows, "point")
          )}
        </CardContent>
      </Card>
    </div>
  );
}
