"use client";

import { useState } from "react";
import Card from "./Card";
import PillButton from "./PillButton";

export default function StoryStep({
  onSubmit,
}: {
  onSubmit: (story: string) => void;
}) {
  const [story, setStory] = useState("");

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-serif text-[#2D3748] leading-snug">
            Thank you for sharing that with me.
          </h1>
          <p className="text-[#2D3748]/50 text-sm max-w-md mx-auto">
            One last thing — tell me what happened, in your own words. No
            pressure, no judgment.
          </p>
        </div>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Just start typing..."
          rows={5}
          className="w-full rounded-2xl border border-[#2D3748]/10 bg-white/60 px-5 py-4 text-sm text-[#2D3748] placeholder:text-[#2D3748]/30 focus:outline-none focus:border-[#A8C5DA] transition-colors resize-none"
        />
        <div className="text-center">
          <PillButton onClick={() => onSubmit(story)}>
            {"I'm done"}
          </PillButton>
        </div>
      </div>
    </Card>
  );
}
