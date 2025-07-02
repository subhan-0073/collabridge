import axios from "axios";
import { useState } from "react";
import { registerUserAPI } from "@/lib/api/auth";
import { useAuthState } from "@/lib/store/auth";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthState();
  const navigate = useNavigate();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrorMsg("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isValidEmail) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();
    const isValidUsername = /^[a-z0-9_]{3,20}$/.test(trimmedUsername);

    if (!isValidUsername) {
      setErrorMsg(
        "Username must be 3–20 characters, lowercase letters, numbers, or underscores."
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      const { user, token } = await registerUserAPI({
        name: name.trim(),
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });
      login(user, token);

      navigate("/landing");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || "Register failed");
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
        <h2 className="text-2xl font-semibold text-center">Register</h2>

        <div className="space-y-1">
          <label htmlFor="name" className=" text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Your name"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="your_username"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 p-2 border rounded-md bg-background"
            placeholder="you@example.com"
            required
          />
        </div>

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
          />

          {errorMsg && (
            <p className="text-sm text-red-500 text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition"
          >
            {loading ? "Registering ..." : "Register"}
          </button>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:text-primary">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
