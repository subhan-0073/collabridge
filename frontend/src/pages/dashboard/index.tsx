import CreateTeamModal from "@/components/dashboard/CreateTeamModal";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div>
        <h1 className="text-4xl font-bold mb-4">Welcome to Dashboard</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          {" "}
          Manage your teams all in one place.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <CreateTeamModal />
        <Button
          variant={"secondary"}
          onClick={() => navigate("/dashboard/teams")}
        >
          View All Teams
        </Button>
      </div>
    </div>
  );
}
