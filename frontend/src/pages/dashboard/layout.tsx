import { useAuthState } from "@/lib/store/auth";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const { user, logout } = useAuthState();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-muted p-4">
        <div className="text-xl font-bold mb-6">Collabridge</div>
        <nav className="space-y-2">
          <Link to="/dashboard" className="block hover:underline">
            Dashboard
          </Link>
          <Link to="/dashboard/projects" className="block hover:underline">
            Projects
          </Link>
          <Link to="/dashboard/tasks" className="block hover:underline">
            Tasks
          </Link>
          <Link to="/dashboard/settings" className="block hover:underline">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="flex justify-between items-center px-6 py-4 border-b">
          <p className="text-muted-foreground">
            Hello, <span className="font-medium">{user?.name}</span>
          </p>

          <button
            onClick={handleLogout}
            className="text-sm underline hover:text-primary"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
