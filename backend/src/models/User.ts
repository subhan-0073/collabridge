export interface IUser {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: "admin" | "member";
  createdAt?: Date;
  updatedAt?: Date;
}
