import { updateTeamAPI } from "@/lib/api/team";
import axios from "axios";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { getAllUsersAPI } from "@/lib/api/user";
import { useAuthState } from "@/lib/store/auth";
import MultiUserSelect from "../common/MultiUserSelect";

type EditTeamModalProps = {
  teamId: string;
  defaultName: string;
  defaultMembers: { _id: string; username: string; name: string }[];
  open: boolean;
  setOpen: (val: boolean) => void;
  onUpdate?: () => void;
};

type UserOption = { label: string; value: string };

export default function EditTeamModal({
  teamId,
  defaultName,
  defaultMembers,
  open,
  setOpen,
  onUpdate,
}: EditTeamModalProps) {
  const [name, setName] = useState(defaultName);
  const [selectedMembers, setSelectedMembers] = useState<UserOption[]>([]);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUserId = useAuthState((s) => s.user?.id);

  useEffect(() => {
    getAllUsersAPI().then((users) => {
      const filtered = users.filter((m) => m._id !== currentUserId);
      const options = filtered.map((u) => ({
        label: `${u.name} (@${u.username})`,
        value: u._id,
      }));
      setAllUsers(options);

      const preselected = defaultMembers.map((m) => ({
        label: `${m.name} (@${m.username})`,
        value: m._id,
      }));
      setSelectedMembers(preselected);
    });
  }, [defaultMembers, currentUserId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await updateTeamAPI(teamId, {
        name,
        members: selectedMembers.map((m) => m.value),
      });
      setOpen(false);
      onUpdate?.();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message);
      } else {
        setErrorMsg("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Team Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}

          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
