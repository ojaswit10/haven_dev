"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F0EDE6] border-b border-[#2D3748]/8">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl text-[#2D3748] tracking-tight">
          haven
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-[#2D3748]/60 hover:text-[#2D3748] transition-colors"
              >
                Dashboard
              </Link>
              <div className="relative group">
                <button className="text-sm text-[#2D3748] font-medium px-4 py-2 rounded-full border border-[#2D3748]/15 hover:border-[#A8C5DA] transition-colors">
                  {session.user?.name?.split(" ")[0]}
                </button>
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-[#2D3748]/8 py-1 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#2D3748]/70 hover:text-[#2D3748] hover:bg-[#F0EDE6] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link
              href="/signin"
              className="text-sm text-[#2D3748] px-5 py-2 rounded-full border border-[#2D3748]/20 hover:border-[#A8C5DA] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}