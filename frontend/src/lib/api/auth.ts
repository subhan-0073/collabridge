import { axiosInstance } from "../axios";

export async function loginUserAPI(data: {
  identifier: string;
  password: string;
}) {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data.data;
}

export async function registerUserAPI(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}) {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data.data;
}
