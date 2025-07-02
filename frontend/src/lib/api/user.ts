import { axiosInstance } from "@/lib/axios";

export async function updateUsernameAPI(newUsername: string) {
  const res = await axiosInstance.patch("/users/me/username", {
    username: newUsername,
  });
  return res.data.data;
}
