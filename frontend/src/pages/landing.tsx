import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(import.meta.env.VITE_API_URL);
      const data = await response.text();
      console.log(data);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to Collabridge</h1>
      <p className="text-muted-foreground max-w-md mb-8 ">
        A real-time team collaboration platform to manage tasks, projects, and
        communication featuring Kanban boards, file sharing, real-time chat, and
        activity feed.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
