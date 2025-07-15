import { createTeamAPI } from "@/lib/api/team";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getAllUsersAPI } from "@/lib/api/user";
import { useAuthState } from "@/lib/store/auth";
import MultiUserSelect from "../common/MultiUserSelect";
import { Label } from "../ui/label";

type UserOption = { label: string; value: string };

export default function CreateTeamModal({
  onCreate,
}: {
  onCreate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<UserOption[]>([]);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUserId = useAuthState((s) => s.user?.id);

  useEffect(() => {
    getAllUsersAPI().then((users) => {
      const filtered = users.filter((u) => u._id !== currentUserId);
      setAllUsers(
        filtered.map((u) => ({
          label: `${u.name} (@${u.username})`,
          value: u._id,
        }))
      );
    });
  }, [currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await createTeamAPI({
        name,
        members: selectedMembers.map((m) => m.value),
      });

      setOpen(false);
      setName("");
      setSelectedMembers([]);
      onCreate?.();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"}> Create Team</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Team Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Team"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Members</Label>
            <MultiUserSelect
              options={allUsers}
              selected={selectedMembers}
              setSelected={setSelectedMembers}
              disabled={loading}
            />
          </div>

          {errorMsg && <p className="text-red-500 font-medium">{errorMsg}</p>}

          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Creating..." : "Create Team"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
