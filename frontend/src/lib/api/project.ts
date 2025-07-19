import { axiosInstance } from "@/lib/axios";

export async function createProjectAPI(projectData: {
  name: string;
  description: string;
  team: string;
  members?: string[];
}) {
  const res = await axiosInstance.post("/projects", projectData);
  return res.data.data.project;
}

export async function getProjectsAPI() {
  const res = await axiosInstance.get("/projects");
  return res.data.data.projects;
}

export async function getProjectByIdAPI(id: string) {
  const res = await axiosInstance.get(`/projects/${id}`);
  return res.data.data.project;
}

export async function updateProjectAPI(
  id: string,
  projectData: {
    name?: string;
    description?: string;
    team?: string;
    members?: string[];
  }
) {
  const res = await axiosInstance.patch(`/projects/${id}`, projectData);
  return res.data.data.project;
}

export async function deleteProjectAPI(id: string) {
  await axiosInstance.delete(`/projects/${id}`);
}
