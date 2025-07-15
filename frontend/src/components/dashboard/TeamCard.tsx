import { deleteTeamAPI } from "@/lib/api/team";
import { useAuthState } from "@/lib/store/auth";
import axios from "axios";
import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import EditTeamModal from "./EditTeamModal";

export type TeamCardProps = {
  _id: string;
  name: string;
  members: { _id: string; name: string }[];
  createdBy: { _id: string; name: string };
  onDeleteSuccess?: () => void;
  onUpdateSuccess?: () => void;
};

export default function TeamCard({
  _id,
  name,
  members,
  createdBy,
  onDeleteSuccess,
  onUpdateSuccess,
}: TeamCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const currentUserId = useAuthState((s) => s.user?.id);
  const isOwner = currentUserId === createdBy._id;
  const filteredMembers = members.filter((m) => m._id !== createdBy._id);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this team?")) return;
    setLoadingDelete(true);
    try {
      await deleteTeamAPI(_id);
      onDeleteSuccess?.();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message);
      else alert("Unexpected error occurred");
    } finally {
      setLoadingDelete(false);
    }
  }
  return (
    <Card className="p-4 space-y-2">
      <h3 className="text-lg font-semibold">{name}</h3>

      <p className="text-sm text-muted-foreground">
        Members:{" "}
        {filteredMembers.length > 0
          ? filteredMembers.map((m) => m.name).join(", ")
          : "No other members yet"}
      </p>

      <p className="text-xs text-muted-foreground italic">
        Created by: {createdBy.name}
      </p>

      {isOwner && (
        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => setEditOpen(true)}
            title="Edit Team"
          >
            Edit
          </Button>

          <Button
            variant={"destructive"}
            size={"sm"}
            onClick={handleDelete}
            disabled={loadingDelete}
            title="Delete Team"
          >
            {loadingDelete ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )}

      <EditTeamModal
        teamId={_id}
        defaultName={name}
        defaultMembers={members.map((m) => ({
          _id: m._id,
          name: m.name,
          username: m.name.toLowerCase(),
        }))}
        open={editOpen}
        setOpen={setEditOpen}
        onUpdate={onUpdateSuccess}
      />
    </Card>
  );
}
