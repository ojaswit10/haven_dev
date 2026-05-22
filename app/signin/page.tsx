"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#F0EDE6] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#FDF8F2] rounded-3xl shadow-sm p-10 text-center space-y-6">
        <h1 className="text-2xl font-serif text-[#2D3748]">
          Welcome back to haven
        </h1>
        <p className="text-[#2D3748]/50 text-sm">
          Sign in to see your results and continue your journey.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/results" })}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full border border-[#2D3748]/20 text-[#2D3748] text-sm font-medium hover:border-[#A8C5DA] hover:bg-[#A8C5DA]/10 transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  );
}