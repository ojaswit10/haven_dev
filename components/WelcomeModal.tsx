// components/WelcomeModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function WelcomeModal() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
  const welcomed = localStorage.getItem("haven_welcomed");
  if (welcomed !== "true") return;

  localStorage.removeItem("haven_welcomed");

  const t = setTimeout(() => {
    setVisible(true);
    setTimeout(() => setAnimateIn(true), 100);
  }, 0);

  return () => clearTimeout(t);
}, []);

const handleClose = () => {
  setAnimateIn(false);
  setTimeout(() => setVisible(false), 500);
};

  if (!visible) return null;

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 transition-all duration-500 ${
        animateIn ? "bg-black/20 backdrop-blur-sm" : "bg-transparent"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#FDF8F2] rounded-3xl px-10 py-12 max-w-sm w-full text-center shadow-xl transition-all duration-700 ease-out ${
          animateIn
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Haven wordmark */}
        <p className="font-serif text-2xl text-[#2D3748] mb-8">haven</p>

        {/* Divider */}
        <div className="w-8 h-px bg-[#A8C5DA] mx-auto mb-8" />

        {/* Welcome message */}
        <h1 className="font-serif text-2xl text-[#2D3748] leading-snug mb-4">
          Welcome, {firstName}.
        </h1>
        <p className="text-[#2D3748]/50 text-sm leading-relaxed mb-10">
          We&apos;ll accompany you on this journey of discovering yourself — gently, at your own pace, and only as far as you want to go.
        </p>

        {/* CTA */}
        <button
          onClick={handleClose}
          className="w-full py-3.5 rounded-full bg-[#A8C5DA] text-[#FDF8F2] text-sm font-semibold hover:bg-[#7BA7C2] transition-colors duration-200"
        >
          I&apos;m ready
        </button>

        <p className="text-[#2D3748]/25 text-xs mt-4">
          You reached out. That already took courage.
        </p>
      </div>
    </div>
  );
}