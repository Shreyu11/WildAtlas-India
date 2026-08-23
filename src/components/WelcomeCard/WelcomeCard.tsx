"use client";

import { IconButton, Card } from "@/design-system";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "wildatlas-welcome-dismissed";

export default function WelcomeCard() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  if (dismissed) return null;

  return (
    <Card.Floating className="absolute bottom-[68px] right-16 z-20 w-80">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/60 pb-2">
        <p className="font-sans text-base font-bold text-zinc-900">Welcome 👋</p>
        <IconButton
          variant="secondary"
          size="sm"
          aria-label="Dismiss welcome card"
          icon={<X className="h-3.5 w-3.5" />}
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
        />
      </div>
      <p className="mt-2.5 text-sm font-normal leading-relaxed text-zinc-600">
        Explore India&apos;s wildlife state by state — tap a photo bubble on the
        map, or spotlight a species from search above.
      </p>
    </Card.Floating>
  );
}
