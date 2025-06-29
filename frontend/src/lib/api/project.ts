import { axiosInstance } from "@/lib/axios";

export async function getProjectsAPI() {
  const res = await axiosInstance.get("/projects");
  return res.data.data.projects;
}
