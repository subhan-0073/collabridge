import CreateProjectModal from "@/components/dashboard/CreateProjectModal";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { getProjectsAPI } from "@/lib/api/project";
import axios from "axios";
import { useEffect, useState } from "react";

type Project = {
  _id: string;
  name: string;
  description: string;
  team: { _id: string; name: string };
  members: { _id: string; username: string; name: string }[];
  createdBy: { _id: string; name: string };
  createdAt: Date;
};
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchProjects() {
    try {
      const data = await getProjectsAPI();
      setProjects(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || "Failed to load projects");
      } else {
        setErrorMsg("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <p>Loading</p>;
  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Your Projects</h2>

      <CreateProjectModal onCreate={fetchProjects} />

      {projects.length === 0 ? (
        <p className="text-muted-foreground italic">
          You haven’t created or joined any projects yet. Use the button above
          to create one.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              {...project}
              createdAt={project.createdAt}
              onDeleteSuccess={fetchProjects}
              onUpdateSuccess={fetchProjects}
            />
          ))}
        </div>
      )}
    </div>
  );
}
