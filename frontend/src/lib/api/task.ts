import { axiosInstance } from "@/lib/axios";

export async function createTaskAPI(taskData: {
  title: string;
  description?: string;
  project: string;
  dueDate?: string;
  assignedTo?: string[];
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  order?: number;
}) {
  const res = await axiosInstance.post("/tasks", taskData);
  return res.data.data.task;
}

export async function getTasksAPI() {
  const res = await axiosInstance.get("/tasks");
  return res.data.data.tasks;
}

export async function getTaskByIdAPI(id: string) {
  const res = await axiosInstance.get(`/tasks/${id}`);
  return res.data.data.task;
}

export async function updateTaskAPI(
  id: string,
  taskData: {
    title?: string;
    description?: string;
    project?: string;
    status?: "todo" | "in-progress" | "done";
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    assignedTo?: string[];
    order?: number;
  }
) {
  const res = await axiosInstance.patch(`/tasks/${id}`, taskData);
  return res.data.data.task;
}

export async function deleteTaskAPI(id: string) {
  await axiosInstance.delete(`/tasks/${id}`);
}
