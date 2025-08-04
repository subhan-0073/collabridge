import { type TaskCardProps } from "@/components/dashboard/TaskCard";
import { getTasksAPI } from "@/lib/api/task";
import axios from "axios";
import { useEffect, useState } from "react";
import CreateTaskModal from "@/components/dashboard/CreateTaskModal";
import KanbanBoard from "@/components/dashboard/KanbanBoard";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchTasks = async () => {
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
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  if (!loading && tasks.length === 0)
    return (
      <div className="space-y-4">
        <CreateTaskModal onCreate={fetchTasks} />
        <p className="text-center text-muted-foreground">No tasks yet.</p>
      </div>
    );
  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;

  return (
    <div className="space-y-4">
      <CreateTaskModal onCreate={fetchTasks} />
      <KanbanBoard />
    </div>
  );
}
