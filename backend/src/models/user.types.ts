export interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  role: "admin" | "member";
  previousUsernames?: string[];
  lastUsernameChange?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
