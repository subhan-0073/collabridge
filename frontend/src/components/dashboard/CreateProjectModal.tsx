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
import { Textarea } from "../ui/textarea";
import { createProjectAPI } from "@/lib/api/project";
import axios from "axios";
import { Label } from "../ui/label";
import { getAllUsersAPI } from "@/lib/api/user";
import { useAuthState } from "@/lib/store/auth";
import { getTeamsAPI } from "@/lib/api/team";
import MultiUserSelect from "../common/MultiUserSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type UserOption = { label: string; value: string };
type TeamOption = { label: string; value: string; members?: UserOption[] };

export default function CreateProjectModal({
  onCreate,
}: {
  onCreate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<UserOption[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamOption | null>(null);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [allTeams, setAllTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const currentUserId = useAuthState((s) => s.user?.id);

  useEffect(() => {
    if (open) {
      getAllUsersAPI().then((users) => {
        const filtered = users.filter((u) => u._id !== currentUserId);
        setAllUsers(
          filtered.map((u) => ({
            label: `${u.name} (@${u.username})`,
            value: u._id,
          }))
        );
      });
    }
  }, [open, currentUserId]);

  useEffect(() => {
    if (open) {
      getTeamsAPI().then((teams) => {
        setAllTeams(
          teams.map(
            (team: {
              _id: string;
              name: string;
              members: { _id: string; name: string; username: string }[];
            }) => ({
              label: team.name,
              value: team._id,
              members: team.members.map((m) => ({
                label: `${m.name} (@${m.username})`,
                value: m._id,
              })),
            })
          )
        );
      });
    }
  }, [open, currentUserId]);

  const teamMembers = selectedTeam
    ? allTeams.find((t) => t.value === selectedTeam.value)?.members || []
    : [];
  const teamMemberIds = new Set(teamMembers.map((m: UserOption) => m.value));
  const memberOptions = allUsers.filter((u) => !teamMemberIds.has(u.value));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      if (!selectedTeam) {
        setErrorMsg("Please select a team");
        setLoading(false);
        return;
      }
      const payload = {
        name,
        description,
        team: selectedTeam.value,
        members: selectedMembers.map((m) => m.value),
      };

      await createProjectAPI(payload);

      setOpen(false);
      setName("");
      setDescription("");
      setSelectedTeam(null);
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
        <Button variant="outline"> Create Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. Productivity Tracker for Devs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Describe the architecture, tech stack, or key features"
            />
          </div>

          <div className="space-y-2">
            <Label>Team</Label>
            <Select
              value={selectedTeam?.value}
              onValueChange={(value) => {
                const team = allTeams.find((t) => t.value === value) || null;
                setSelectedTeam(team);
              }}
              disabled={loading}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {allTeams.map((team) => (
                  <SelectItem key={team.value} value={team.value}>
                    {team.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <MultiUserSelect
              options={memberOptions}
              selected={selectedMembers}
              setSelected={setSelectedMembers}
              disabled={loading}
            />
          </div>

          {errorMsg && <p className="text-red-500 font-medium">{errorMsg}</p>}

          <Button
            type="submit"
            disabled={loading || !name.trim() || !selectedTeam}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
