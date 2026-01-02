import { BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground",
        className
      )}
    >
      <BookOpenCheck className="h-8 w-8" />
    </div>
  );
}
