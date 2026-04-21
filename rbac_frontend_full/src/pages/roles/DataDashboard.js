import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Data Dashboard</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 block">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <h3 className="text-xl font-bold text-center capitalize">{project.project_name}</h3>
              </div>
              <div className="p-4">
                <img 
                  src={project.image || "https://via.placeholder.com/400x250?text=No+Image"} 
                  alt={project.project_name} 
                  className="w-full h-[220px] object-cover rounded-xl"
                />
              </div>
              <div className="px-4 pb-4">
                <Button 
                  className="w-full py-6 text-base" 
                  onClick={() =>
                    navigate(`/project-details/${project.id}`, {
                      state: { projectName: project.project_name },
                    })
                  }
                >
                  Update Data
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
