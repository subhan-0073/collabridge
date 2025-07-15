import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X } from "lucide-react";
import { useState } from "react";
import { useAuthState } from "@/lib/store/auth";

type UserOption = {
  label: string;
  value: string;
};

type MultiUserSelectProps = {
  options: UserOption[];
  selected: UserOption[];
  setSelected: (users: UserOption[]) => void;
  disabled?: boolean;
};

export default function MultiUserSelect({
  options,
  selected,
  setSelected,
  disabled,
}: MultiUserSelectProps) {
  const [open, setOpen] = useState(false);
  const currentUserId = useAuthState((s) => s.user?.id);

  const toggleUser = (user: UserOption) => {
    const exists = selected.some((u) => u.value === user.value);
    if (exists) {
      setSelected(selected.filter((u) => u.value !== user.value));
    } else {
      setSelected([...selected, user]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((user) => (
          <div
            key={user.value}
            className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm"
          >
            {user.label}
            {(currentUserId ?? "") !== user.value && (
              <button
                type="button"
                onClick={() =>
                  setSelected(selected.filter((u) => u.value !== user.value))
                }
                className="hover:text-red-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" disabled={disabled}>
              + Add Members
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search users..." />
              <CommandList>
                {options
                  .filter(
                    (user) => !selected.some((s) => s.value === user.value)
                  )
                  .map((user) => (
                    <CommandItem
                      key={user.value}
                      onSelect={() => toggleUser(user)}
                    >
                      {user.label}
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
