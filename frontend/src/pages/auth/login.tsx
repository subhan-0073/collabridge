import axios from "axios";
import { useState } from "react";
import { loginUserAPI } from "@/lib/api/auth";
import { useAuthState } from "@/lib/store/auth";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthState();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrorMsg("");
    setLoading(true);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isUsername = /^[a-z0-9_]{3,20}$/.test(identifier.toLowerCase());

    if (!isEmail && !isUsername) {
      setErrorMsg("Please enter a valid email or username");
      return;
    }

    try {
      const { user, token } = await loginUserAPI({ identifier, password });
      login(user, token);
      navigate("/landing");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || "Login failed");
      } else {
        setErrorMsg("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Login</h2>

        <label htmlFor="identifier" className="text-sm font-medium">
          Email or Username
        </label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-background"
          placeholder="you@example.com or username"
          required
        />

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="••••••••"
            required
          ></input>
        </div>
        {errorMsg && (
          <p className="text-sm text-red-500 text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="underline hover:text-primary">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
