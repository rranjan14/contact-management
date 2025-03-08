"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  onAddContact: () => void;
}

export const Header = ({ onAddContact }: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-background z-10 h-20">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button onClick={onAddContact}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>
    </header>
  );
};
