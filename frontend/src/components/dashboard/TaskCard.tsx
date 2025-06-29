export type TaskCardProps = {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assignedTo: { name: string }[];
  project: { name: string };
};

export default function TaskCard({
  title,
  description,
  status,
  priority,
  dueDate,
  assignedTo,
  project,
}: TaskCardProps) {
  const priorityColor = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-red-600",
  }[priority];

  const statusLabel = {
    todo: "To Do",
    "in-progress": "In Progress",
    done: "Done",
  }[status];

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString()
    : "No due date";

  return (
    <div className="border rounded-xl bg-card p-4 shadow-sm hover:shadow-md transition space-y-2">
      <h3 className="font-semibold text-lg">{title}</h3>

      {description && (
        <p className="text-muted-foreground text-sm line-clamp-2">
          {description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-sm mt-2">
        <span className={`font-medium ${priorityColor}`}>🔥 {priority}</span>
        <span className="text-muted-foreground">📌 {statusLabel}</span>
        <span className="text-muted-foreground">📅 {formattedDate}</span>

        {project && (
          <span className="text-muted-foreground">{project?.name}</span>
        )}

        <span className="text-muted-foreground">👥 {assignedTo.length}</span>
      </div>
    </div>
  );
}
