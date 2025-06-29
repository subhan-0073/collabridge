import ProjectCard, {
  type ProjectCardProps,
} from "@/components/dashboard/ProjectCard";
import { getProjectsAPI } from "@/lib/api/project";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
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

    fetchProjects();
  }, [projects]);

  if (loading) return <p>Loading</p>;
  if (!loading && projects.length === 0)
    return (
      <p className="text-center text-muted-foreground">No projects yet.</p>
    );

  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {projects.map((project: ProjectCardProps) => (
        <ProjectCard key={project._id} {...project} />
      ))}
    </div>
  );
}
