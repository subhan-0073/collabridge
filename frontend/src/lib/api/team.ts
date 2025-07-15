import { axiosInstance } from "@/lib/axios";

export async function createTeamAPI(teamData: {
  name: string;
  members?: string[];
}) {
  const res = await axiosInstance.post("/teams", teamData);
  return res.data.data.team;
}

export async function getTeamsAPI() {
  const res = await axiosInstance.get("/teams");
  return res.data.data.teams;
}

export async function getTeamByIdAPI(id: string) {
  const res = await axiosInstance.get(`/teams/${id}`);
  return res.data.data.team;
}

export async function updateTeamAPI(
  id: string,
  teamData: { name?: string; members?: string[] }
) {
  const res = await axiosInstance.patch(`/teams/${id}`, teamData);
  return res.data.data.team;
}

export async function deleteTeamAPI(id: string) {
  await axiosInstance.delete(`/teams/${id}`);
}
