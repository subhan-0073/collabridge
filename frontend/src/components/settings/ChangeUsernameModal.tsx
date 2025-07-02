import { updateUsernameAPI } from "@/lib/api/user";
import { useAuthState } from "@/lib/store/auth";
import axios from "axios";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";

export default function ChangeUsernameModal() {
  const { user, token, login } = useAuthState();
  const [open, setOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const trimmed = newUsername.trim().toLowerCase();
    const isValid = /^[a-z0-9_]{3,20}$/.test(trimmed);
    if (!isValid) {
      setErrorMsg(
        "Invalid username. 3–20 chars, lowercase letters, numbers, underscores."
      );
      return;
    }

    setLoading(true);

    try {
      const updated = await updateUsernameAPI(trimmed);

      login(
        {
          ...user!,
          username: updated.username,
        },
        token!
      );
      setSuccessMsg("Username updated successfully");
      setNewUsername("");

      console.log(updated);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || "Update failed");
      } else {
        setErrorMsg("Failed to update failed");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Change Username</Button>
        </DialogTrigger>

        <DialogContent className="max-w-sm">
          <DialogHeader>change username</DialogHeader>

          <p className="text-sm text-muted-foreground mb-2">
            Current username: <strong>{user?.username}</strong>
          </p>

          <Input
            placeholder="Enter new username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "Updating..." : "Update Username"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
