import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TaskCardProps } from "./TaskCard";
import TaskCard from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";

type KanbanColumnProps = {
  status: "todo" | "in-progress" | "done";
  tasks: TaskCardProps[];
};

export default function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const statusLabel = {
    todo: "To Do",
    "in-progress": "In Progress",
    done: "Done",
  }[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[300px] min-h-[250px] bg-muted rounded-lg p-4 transition-colors duration-200 ${
        isOver ? "ring-4 ring-blue-400 bg-blue-50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{statusLabel}</h2>
      </div>
      <SortableContext
        items={tasks.map((task) => task._id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.length === 0 && (
          <div className="p-4 text-muted-foreground text-sm text-center border border-dashed rounded-md">
            Drop a task here
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard key={task._id} {...task} />
        ))}
      </SortableContext>
    </div>
  );
}
