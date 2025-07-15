import { useEffect, useState } from "react";
import { getTeamsAPI } from "@/lib/api/team";
import TeamCard from "../../components/dashboard/TeamCard";
import axios from "axios";
import CreateTeamModal from "../../components/dashboard/CreateTeamModal";

type Team = {
  _id: string;
  name: string;
  members: { _id: string; name: string }[];
  createdBy: { _id: string; name: string };
};

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchTeams() {
    try {
      const data = await getTeamsAPI();
      setTeams(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || "Failed to create teams");
      } else {
        setErrorMsg("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  if (loading) return <p>Loading teams...</p>;
  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Your Teams</h2>

      <CreateTeamModal onCreate={fetchTeams} />

      {teams.length === 0 ? (
        <p className="text-muted-foreground italic">
          You haven't created or joined any teams yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard
              key={team._id}
              {...team}
              onDeleteSuccess={fetchTeams}
              onUpdateSuccess={fetchTeams}
            />
          ))}
        </div>
      )}
    </div>
  );
}
