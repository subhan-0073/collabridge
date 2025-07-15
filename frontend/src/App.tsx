import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import LandingPage from "./pages/landing";
import Dashboard from "./pages/dashboard";
import DashboardLayout from "./pages/dashboard/layout";
import PublicOnlyRoute from "./components/route-guards/PublicOnlyRoute";
import PrivateRoute from "./components/route-guards/PrivateRoute";
import ProjectsPage from "./pages/dashboard/projects";
import TasksPage from "./pages/dashboard/tasks";
import SettingsPage from "./pages/dashboard/settings";
import TeamsPage from "./pages/dashboard/teams";

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />
      {/* Public-only Routes  */}
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />}></Route>
    </Routes>
  );
}
