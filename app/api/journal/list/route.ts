// app/api/journal/list/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      mood: true,
      aiReflection: true,
      createdAt: true,
    },
  });

  // Attach day numbers — day 1 is the oldest entry
  const withDays = entries
    .slice()
    .reverse()
    .map((entry, index) => ({ ...entry, dayNumber: index + 1 }))
    .reverse();

  return NextResponse.json({ entries: withDays });
}