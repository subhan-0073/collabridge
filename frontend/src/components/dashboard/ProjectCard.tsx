import { useAuthState } from "@/lib/store/auth";
import { Card } from "../ui/card";
import { useState } from "react";
import { deleteProjectAPI } from "@/lib/api/project";
import axios from "axios";
import { Button } from "../ui/button";
import EditProjectModal from "./EditProjectModal";
import { Pencil, Trash2, Folder, Crown } from "lucide-react";

export type ProjectCardProps = {
  _id: string;
  name: string;
  description: string;
  team: {
    _id: string;
    name: string;
    members?: { _id: string; username: string; name: string }[];
  };
  members: { _id: string; username: string; name: string }[];
  createdBy: { _id: string; name: string };
  createdAt: Date;
  onDeleteSuccess?: () => void;
  onUpdateSuccess?: () => void;
};

function getInitials(name?: string) {
  if (!name || typeof name !== "string") return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function ProjectCard({
  _id,
  name,
  description,
  team,
  members,
  createdBy,
  createdAt,
  onDeleteSuccess,
  onUpdateSuccess,
}: ProjectCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const currentUserId = useAuthState((s) => s.user?.id);
  const isOwner = currentUserId === createdBy._id;

  const teamMembers = team.members || [];
  const teamMemberIds = new Set(teamMembers.map((m) => m._id));
  const extraMembers = members.filter((m) => !teamMemberIds.has(m._id));

  function getNames(arr: { name: string }[]) {
    return arr.map((m) => m.name).join(", ");
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setLoadingDelete(true);
    try {
      await deleteProjectAPI(_id);
      onDeleteSuccess?.();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message);
      else alert("Unexpected error occurred");
    } finally {
      setLoadingDelete(false);
    }
  }
  return (
    <Card className="relative overflow-hidden border-l-4 border-primary bg-gradient-to-br from-card via-muted/50 to-card rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition p-0">
      <div className="flex items-center gap-3 px-6 pt-5 pb-2">
        <div className="bg-primary/10 rounded-full p-2">
          <Folder className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold leading-tight mb-0.5">{name}</h3>
          <div className="text-xs text-muted-foreground font-medium">
            Team: {team?.name}
          </div>
        </div>
      </div>

      {description && (
        <p className="text-muted-foreground text-sm px-6 mb-2 line-clamp-2">
          {description}
        </p>
      )}

      <div className="px-6 mb-2 mt-3 space-y-2">
        <div>
          <span className="text-xs text-muted-foreground font-semibold mr-2">
            Team Members
          </span>
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 3).map((m) =>
              m && m.name ? (
                <span
                  key={m._id}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-base font-bold border-2 border-card shadow"
                  title={m.name}
                >
                  {getInitials(m.name)}
                </span>
              ) : null
            )}
            {teamMembers.length > 3 && (
              <span
                className="ml-1 text-xs text-muted-foreground cursor-pointer"
                title={getNames(teamMembers)}
              >
                +{teamMembers.length - 3}
              </span>
            )}
          </div>
        </div>

        {extraMembers.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground font-semibold mr-2">
              Extra Members
            </span>
            <div className="flex -space-x-2">
              {extraMembers.slice(0, 3).map((m) =>
                m && m.name ? (
                  <span
                    key={m._id}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-base font-bold border-2 border-card shadow"
                    title={m.name}
                  >
                    {getInitials(m.name)}
                  </span>
                ) : null
              )}
              {extraMembers.length > 3 && (
                <span
                  className="ml-1 text-xs text-muted-foreground cursor-pointer"
                  title={getNames(extraMembers)}
                >
                  +{extraMembers.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-6">
        <hr className="my-2" />
      </div>

      <div className="flex items-center justify-between px-6 pb-4">
        <div className="text-xs text-muted-foreground italic flex items-center gap-1">
          Manager: {createdBy.name}
          <span title="Project Manager">
            <Crown className="w-4 h-4 text-yellow-500 ml-1" />
          </span>
          {createdAt && (
            <span className="ml-2">
              &middot; {new Date(createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              title="Edit Project"
              aria-label="Edit Project"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loadingDelete}
              title="Delete Project"
              aria-label="Delete Project"
            >
              {loadingDelete ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <EditProjectModal
        projectId={_id}
        defaultDescription={description}
        defaultName={name}
        defaultMembers={members.map((m) => ({
          _id: m._id,
          username: m.username,
          name: m.name,
        }))}
        defaultTeam={{ label: team.name, value: team._id }}
        open={editOpen}
        setOpen={setEditOpen}
        onUpdate={onUpdateSuccess}
      />
    </Card>
  );
}
