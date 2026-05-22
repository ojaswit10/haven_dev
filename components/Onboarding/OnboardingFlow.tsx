"use client";

import { useState } from "react";
import { Heart, CloudRain, Users, Compass } from "lucide-react";
import Card from "./shared/Card";
import PillButton from "./shared/PillButton";
import HeartBreakFlow from "./categories/HeartBreakFlow";

type Category = "heartbreak" | "grief" | "loneliness" | "feelinglost" | null;
type Step = "welcome" | "exploring" | "category" | "flow";

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [category, setCategory] = useState<Category>(null);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setStep("flow");
  };

  if (step === "flow") {
    return (
      <main className="min-h-screen bg-[#F0EDE6] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          {category === "heartbreak" && <HeartBreakFlow />}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0EDE6] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">

        {step === "welcome" && (
          <Card>
            <div className="text-center space-y-6">
              <h1 className="text-3xl md:text-4xl font-serif text-[#2D3748] leading-snug">
                Hello. Why are you here today?
              </h1>
              <p className="text-[#2D3748]/50 text-base">
                This is a safe, judgment-free space. Take your time.
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <PillButton onClick={() => setStep("category")}>
                  I seek answers
                </PillButton>
                <PillButton onClick={() => setStep("exploring")} outline>
                  Just exploring
                </PillButton>
              </div>
            </div>
          </Card>
        )}

        {step === "exploring" && (
          <Card>
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-serif text-[#2D3748] leading-snug">
                Hello. Why are you here today?
              </h1>
              <p className="text-[#2D3748]/50 text-base">
                This is a safe, judgment-free space. Take your time.
              </p>
              <p className="text-[#2D3748]/40 text-base pt-2">
                {"That's okay. We're here whenever you're ready."}
              </p>
            </div>
          </Card>
        )}

        {step === "category" && (
          <Card>
            <h1 className="text-3xl md:text-4xl font-serif text-[#2D3748] text-center mb-8 leading-snug">
              What seems to be troubling you?
            </h1>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  key: "heartbreak" as Category,
                  icon: <Heart size={22} className="text-[#A8C5DA]" />,
                  title: "Heartbreak / Breakup",
                  desc: "Navigating the end of a relationship",
                  active: true,
                },
                {
                  key: "grief" as Category,
                  icon: <CloudRain size={22} className="text-[#2D3748]/20" />,
                  title: "Grief / Loss",
                  desc: "Coping with losing someone dear",
                  active: false,
                },
                {
                  key: "loneliness" as Category,
                  icon: <Users size={22} className="text-[#2D3748]/20" />,
                  title: "Loneliness",
                  desc: "Feeling disconnected from others",
                  active: false,
                },
                {
                  key: "feelinglost" as Category,
                  icon: <Compass size={22} className="text-[#2D3748]/20" />,
                  title: "Feeling Lost",
                  desc: "Searching for direction and purpose",
                  active: false,
                },
              ].map((cat) => (
                <button
                  key={cat.title}
                  onClick={cat.active ? () => handleCategorySelect(cat.key) : undefined}
                  disabled={!cat.active}
                  className={`
                    relative text-left p-5 rounded-2xl border transition-all duration-200
                    ${cat.active
                      ? "border-[#A8C5DA] bg-white/80 hover:shadow-md cursor-pointer"
                      : "border-[#2D3748]/8 bg-white/30 opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  {!cat.active && (
                    <span className="absolute top-3 right-3 text-[10px] text-[#2D3748]/30 border border-[#2D3748]/15 rounded-full px-2 py-0.5">
                      coming soon
                    </span>
                  )}
                  <div className="mb-3">{cat.icon}</div>
                  <p className={`font-semibold text-sm mb-1 ${cat.active ? "text-[#2D3748]" : "text-[#2D3748]/30"}`}>
                    {cat.title}
                  </p>
                  <p className={`text-xs ${cat.active ? "text-[#2D3748]/50" : "text-[#2D3748]/25"}`}>
                    {cat.desc}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        )}

      </div>
    </main>
  );
}