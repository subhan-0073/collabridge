import ChangeUsernameModal from "@/components/settings/ChangeUsernameModal";

export default function SettingsPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section>
        <h2 className="text-lg font-semibold mb-2">Account</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Change your username. You can only do this once every 30 days.
        </p>
        <ChangeUsernameModal />
      </section>
    </div>
  );
}
