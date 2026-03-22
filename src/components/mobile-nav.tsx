"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="rounded-md p-1.5 transition-colors hover:bg-accent">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div onClick={() => setOpen(false)}>
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>
      <span className="text-sm font-semibold">App Pitcher</span>
    </div>
  );
}
