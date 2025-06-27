import { axiosInstance } from "../axios";

export async function loginUserAPI(data: { email: string; password: string }) {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data.data;
}

export async function registerUserAPI(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data.data;
}
