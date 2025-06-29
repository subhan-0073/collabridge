import { axiosInstance } from "@/lib/axios";

export async function getTasksAPI() {
  const res = await axiosInstance.get("/tasks");
  return res.data.data.tasks;
}
