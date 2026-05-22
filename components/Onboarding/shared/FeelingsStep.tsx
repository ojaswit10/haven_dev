"use client";

import { useState } from "react";
import Card from "./Card";
import PillButton from "./PillButton";

const FEELINGS = [
  "Numb",
  "Angry",
  "Sad",
  "Confused",
  "Relieved but hurt",
  "Empty",
  "Anxious",
];

export default function FeelingsStep({
  onContinue,
}: {
  onContinue: (feelings: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (f: string) =>
    setSelected((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  return (
    <Card>
      <div className="text-center space-y-6">
        <h1 className="text-2xl md:text-3xl font-serif text-[#2D3748] leading-snug">
          How do you feel right now?
        </h1>
        <p className="text-[#2D3748]/40 text-sm">Select all that apply</p>
        <div className="flex flex-wrap justify-center gap-3">
          {FEELINGS.map((f) => (
            <PillButton
              key={f}
              onClick={() => toggle(f)}
              selected={selected.includes(f)}
              outline={!selected.includes(f)}
            >
              {f}
            </PillButton>
          ))}
        </div>
        <div className="pt-2">
          <PillButton onClick={() => onContinue(selected)}>
            Continue
          </PillButton>
        </div>
      </div>
    </Card>
  );
}
