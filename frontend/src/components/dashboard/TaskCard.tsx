import { deleteTaskAPI } from "@/lib/api/task";
import EditTaskModal from "./EditTaskModal";
import axios from "axios";
import { useState } from "react";
import { Button } from "../ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useAuthState } from "@/lib/store/auth";

export type TaskCardProps = {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assignedTo: { _id: string; username: string; name: string }[];
  project: { _id: string; name: string };
  order: number;
  createdBy: { _id: string; name: string };
  createdAt?: string | Date;
  onDeleteSuccess?: () => void;
  onUpdateSuccess?: () => void;
};

export default function TaskCard({
  _id,
  title,
  description,
  status,
  priority,
  dueDate,
  assignedTo,
  project,
  order,
  createdBy,
  createdAt,
  onDeleteSuccess,
  onUpdateSuccess,
}: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const currentUserId = useAuthState((s) => s.user?.id);
  const isOwner = currentUserId === createdBy?._id;
  const isAssigned = assignedTo.some((member) => member._id === currentUserId);
  const canEdit = isOwner || isAssigned;
  const role = isOwner ? "isOwner" : "isAssigned";

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

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setLoadingDelete(true);
    try {
      await deleteTaskAPI(_id);
      onDeleteSuccess?.();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message);
      else alert("Unexpected error occurred");
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <div className="border rounded-xl bg-card p-4 shadow-sm hover:shadow-md transition space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditOpen(true)}
              title="Edit Task"
              aria-label="Edit Task"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          )}

          {isOwner && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              title="Delete Task"
              aria-label="Delete Task"
            >
              {loadingDelete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrashIcon className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      {description && (
        <p className="text-muted-foreground text-sm line-clamp-2">
          {description}
        </p>
      )}
      <div className="flex flex-wrap gap-2 text-sm mt-2">
        <span className={`font-medium ${priorityColor}`}>
          🔥 {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
        <span className="text-muted-foreground">📌 {statusLabel}</span>
        <span className="text-muted-foreground">📅 {formattedDate}</span>

        {project && (
          <span className="text-muted-foreground">{project?.name}</span>
        )}

        <span className="text-muted-foreground">👥 {assignedTo.length}</span>
      </div>

      {createdAt && (
        <div className="text-xs text-muted-foreground italic mt-2">
          Created: {new Date(createdAt).toLocaleDateString()}
        </div>
      )}
      <EditTaskModal
        taskId={_id}
        defaultTitle={title}
        defaultDescription={description || ""}
        defaultProject={{
          label: project?.name || "",
          value: project?._id || "",
        }}
        defaultAssignedTo={assignedTo.map((a) => ({
          _id: a._id,
          username: a.username,
          name: a.name,
        }))}
        defaultDueDate={dueDate || ""}
        defaultStatus={status || "todo"}
        defaultPriority={priority}
        defaultOrder={order}
        open={editOpen}
        role={role}
        setOpen={setEditOpen}
        onUpdate={onUpdateSuccess}
      />
    </div>
  );
}
