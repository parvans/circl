"use client";

import { useState } from "react";
import { SmilePlusIcon } from "lucide-react";
import { Button } from "./ui/button";

const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥳",
  "🔥",
  "❤️",
  "👏",
  "🙌",
  "🤝",
  "🤔",
  "😎",
  "😭",
  "🎉",
  "🚀",
  "💯",
  "✨",
];

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  align?: "left" | "right";
};

export default function EmojiPicker({onSelect, align = "left"}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const panelAlignment = align === "right" ? "right-0" : "left-0";

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-primary"
        onClick={() => setOpen((prev) => !prev)}
      >
        <SmilePlusIcon className="size-4" />
        Emoji
      </Button>

      {open ? (
        <div
          className={`absolute bottom-full z-50 mb-2 w-64 rounded-2xl border bg-background p-3 shadow-lg ${panelAlignment}`}
        >
          <div className="grid grid-cols-4 gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded-xl p-2 text-2xl transition-colors hover:bg-muted"
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
