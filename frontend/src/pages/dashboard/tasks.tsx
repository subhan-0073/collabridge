import TaskCard, { type TaskCardProps } from "@/components/dashboard/TaskCard";
import { getTasksAPI } from "@/lib/api/task";
import axios from "axios";
import { useEffect, useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getTasksAPI();
        setTasks(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setErrorMsg(err.response?.data?.message || "Failed to load tasks");
        } else {
          setErrorMsg("Unexpected error occurred ");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [tasks]);

  if (loading) return <p>Loading</p>;
  if (!loading && tasks.length === 0)
    return <p className="text-center text-muted-foreground">No tasks yet.</p>;
  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {tasks.map((task: TaskCardProps) => (
        <TaskCard key={task._id} {...task} />
      ))}
    </div>
  );
}
