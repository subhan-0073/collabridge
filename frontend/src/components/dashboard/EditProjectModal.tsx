import { updateProjectAPI } from "@/lib/api/project";
import axios from "axios";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { getAllUsersAPI } from "@/lib/api/user";
import { useAuthState } from "@/lib/store/auth";
import MultiUserSelect from "../common/MultiUserSelect";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getTeamsAPI } from "@/lib/api/team";

type EditProjectModalProps = {
  projectId: string;
  defaultDescription: string;
  defaultName: string;
  defaultMembers: { _id: string; username: string; name: string }[];
  defaultTeam: { label: string; value: string };
  open: boolean;
  setOpen: (val: boolean) => void;
  onUpdate?: () => void;
};

type UserOption = { label: string; value: string };
type TeamOption = { label: string; value: string; members?: UserOption[] };

export default function EditProjectModal({
  projectId,
  defaultDescription,
  defaultName,
  defaultMembers,
  defaultTeam,
  open,
  setOpen,
  onUpdate,
}: EditProjectModalProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [selectedTeam, setSelectedTeam] = useState<TeamOption>(defaultTeam);
  const [selectedMembers, setSelectedMembers] = useState<UserOption[]>([]);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [allTeams, setAllTeams] = useState<TeamOption[]>([]);
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

      const preselected = defaultMembers.map((m) => ({
        label: `${m.name} (@${m.username})`,
        value: m._id,
      }));
      setSelectedMembers(preselected);
    });
  }, [defaultMembers, currentUserId]);

  useEffect(() => {
    setName(defaultName);
    setDescription(defaultDescription);
    setSelectedTeam(defaultTeam);
    setSelectedMembers(
      defaultMembers.map((m) => ({
        label: `${m.name} (@${m.username})`,
        value: m._id,
      }))
    );
    setErrorMsg("");
  }, [open, defaultName, defaultDescription, defaultTeam, defaultMembers]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await updateProjectAPI(projectId, {
        name,
        description,
        team: selectedTeam.value,
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

  const teamMembers = selectedTeam
    ? allTeams.find((t) => t.value === selectedTeam.value)?.members || []
    : [];
  const teamMemberIds = new Set(teamMembers.map((m: UserOption) => m.value));
  const memberOptions = allUsers.filter((u) => !teamMemberIds.has(u.value));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
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
                const team = allTeams.find((t) => t.value === value);
                if (team) setSelectedTeam(team);
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

          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
