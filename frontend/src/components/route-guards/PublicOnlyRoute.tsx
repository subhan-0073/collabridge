import { useAuthState } from "@/lib/store/auth";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function PublicOnlyRoute({ children }: Props) {
  const { user } = useAuthState();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
