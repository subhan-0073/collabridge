import { axiosInstance } from "@/lib/axios";

export async function updateUsernameAPI(newUsername: string) {
  const res = await axiosInstance.patch("/users/me/username", {
    username: newUsername,
  });
  return res.data.data;
}

export async function getAllUsersAPI() {
  const res = await axiosInstance.get("/users");
  return res.data.data.users as {
    _id: string;
    username: string;
    name: string;
  }[];
}
