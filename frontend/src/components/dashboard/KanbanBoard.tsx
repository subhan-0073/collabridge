import { useEffect, useState } from "react";
import type { TaskCardProps } from "./TaskCard";
import { getTasksAPI, updateTaskAPI } from "@/lib/api/task";
import axios from "axios";
import KanbanColumn from "./KanbanColumn";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  type DragOverEvent,
} from "@dnd-kit/core";
import TaskCard from "./TaskCard";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<TaskCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTask, setActiveTask] = useState<TaskCardProps | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasks = await getTasksAPI();
      setTasks(tasks);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message);
      } else {
        setErrorMsg("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((task) => task._id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((task) => task._id === over.id);
    const newStatus = overTask ? overTask.status : activeTask.status;

    const columnTasks = tasks
      .filter((task) => task.status === newStatus && task._id !== active.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const overIndex = overTask
      ? columnTasks.findIndex((task) => task._id === over.id)
      : columnTasks.length;

    columnTasks.splice(overIndex, 0, { ...activeTask, status: newStatus });

    const updatedTasks = tasks.map((task) =>
      task._id === active.id
        ? { ...task, status: newStatus, order: overIndex }
        : task.status === newStatus
        ? {
            ...task,
            order:
              columnTasks.findIndex(
                (columnTask) => columnTask._id === task._id
              ) !== -1
                ? columnTasks.findIndex(
                    (columnTask) => columnTask._id === task._id
                  )
                : task.order,
          }
        : task
    );

    setTasks(updatedTasks);
    updateTaskAPI(activeTask._id, { status: newStatus, order: overIndex });
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (["todo", "in-progress", "done"].includes(over.id as string)) {
      setTasks((prevTasks) => {
        const activeTask = prevTasks.find(
          (task) => String(task._id) === String(active.id)
        );
        if (!activeTask) return prevTasks;

        const filtered = prevTasks.filter(
          (task) => String(task._id) !== String(active.id)
        );
        return [
          ...filtered,
          {
            ...activeTask,
            status: over.id as "todo" | "in-progress" | "done",
            order: 9999,
          },
        ];
      });
    }
  }
  if (loading) return <div>Loading...</div>;
  if (errorMsg) return <div className="text-red-500">{errorMsg}</div>;

  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["todo", "in-progress", "done"].map((status) => (
            <KanbanColumn
              key={status}
              status={status as "todo" | "in-progress" | "done"}
              tasks={tasks.filter((task) => task.status === status)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard {...activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
