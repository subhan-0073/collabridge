import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import MultiUserSelect from "../common/MultiUserSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getProjectsAPI } from "@/lib/api/project";
import { getTeamByIdAPI } from "@/lib/api/team";
import { updateTaskAPI } from "@/lib/api/task";
import axios from "axios";

type UserOption = { label: string; value: string };
type Member = { _id: string; username: string; name: string };
type ProjectAPI = {
  _id: string;
  name: string;
  members: Member[];
  team: { _id: string; name: string };
};
type ProjectOption = {
  label: string;
  value: string;
  members: UserOption[];
  teamId?: string;
};
type TeamAPI = {
  _id: string;
  name: string;
  members: Member[];
};

const STATUS_OPTIONS = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
];
const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

type EditTaskModalProps = {
  taskId: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultProject: { label: string; value: string };
  defaultAssignedTo: { _id: string; username: string; name: string }[];
  defaultDueDate: string;
  defaultStatus: string;
  defaultPriority: string;
  defaultOrder: number;
  open: boolean;
  role: "isOwner" | "isAssigned";
  setOpen: (val: boolean) => void;
  onUpdate?: () => void;
};

export default function EditTaskModal({
  taskId,
  defaultTitle,
  defaultDescription,
  defaultProject,
  defaultAssignedTo,
  defaultDueDate,
  defaultStatus,
  defaultPriority,
  defaultOrder,
  open,
  role,
  setOpen,
  onUpdate,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(
    null
  );
  const [allProjects, setAllProjects] = useState<ProjectOption[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<UserOption[]>([]);
  const [dueDate, setDueDate] = useState(defaultDueDate || "");
  const [status, setStatus] = useState(defaultStatus || "todo");
  const [priority, setPriority] = useState(defaultPriority || "medium");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [teamMembers, setTeamMembers] = useState<UserOption[]>([]);
  const isOwner = role === "isOwner";

  useEffect(() => {
    if (open) {
      getProjectsAPI().then((projects: ProjectAPI[]) => {
        const mapped = projects.map((p) => ({
          label: p.name,
          value: p._id,
          members: (p.members || []).map((m) => ({
            label: `${m.name} (@${m.username})`,
            value: m._id,
          })),
          teamId: p.team?._id,
        }));
        setAllProjects(mapped);
        const found =
          mapped.find((p) => p.value === defaultProject.value) || null;
        setSelectedProject(found);
      });
    }
  }, [open, defaultProject.value]);

  useEffect(() => {
    setSelectedMembers(
      defaultAssignedTo.map((m) => ({
        label: `${m.name} (@${m.username})`,
        value: m._id,
      }))
    );
  }, [open, defaultAssignedTo]);

  useEffect(() => {
    if (selectedProject && selectedProject.teamId) {
      getTeamByIdAPI(selectedProject.teamId).then((team: TeamAPI) => {
        setTeamMembers(
          (team.members || []).map((m) => ({
            label: `${m.name} (@${m.username})`,
            value: m._id,
          }))
        );
      });
    } else {
      setTeamMembers([]);
    }
  }, [selectedProject]);

  const memberOptions = (() => {
    if (!selectedProject) return [];
    const all = [...selectedProject.members, ...teamMembers];
    const seen = new Set<string>();
    return all.filter((u) => {
      if (seen.has(u.value)) return false;
      seen.add(u.value);
      return true;
    });
  })();

  useEffect(() => {
    setSelectedMembers((prev) =>
      prev.filter((m) => memberOptions.some((opt) => opt.value === m.value))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, teamMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      if (isOwner) {
        if (!selectedProject) {
          setErrorMsg("Please select a project");
          setLoading(false);
          return;
        }
        await updateTaskAPI(taskId, {
          title,
          description,
          project: selectedProject.value,
          assignedTo: selectedMembers.map((m) => m.value),
          dueDate: dueDate || undefined,
          status: status as "todo" | "in-progress" | "done",
          priority: priority as "low" | "medium" | "high",
          order: defaultOrder,
        });
      } else {
        await updateTaskAPI(taskId, {
          status: status as "todo" | "in-progress" | "done",
        });
      }
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading || !isOwner}
              placeholder="e.g. Design login page"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading || !isOwner}
              placeholder="Describe the task details, requirements, etc."
            />
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={selectedProject?.value}
              onValueChange={(value) => {
                const project =
                  allProjects.find((p) => p.value === value) || null;
                setSelectedProject(project);
              }}
              disabled={loading || !isOwner}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {allProjects.map((project) => (
                  <SelectItem key={project.value} value={project.value}>
                    {project.label}
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
              disabled={loading || !selectedProject || !isOwner}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={loading || !isOwner}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
                disabled={loading}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={setPriority}
                disabled={loading || !isOwner}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {errorMsg && <p className="text-red-500 font-medium">{errorMsg}</p>}

          <Button
            type="submit"
            disabled={
              loading || (isOwner && (!title.trim() || !selectedProject))
            }
          >
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
