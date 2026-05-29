// app/api/journal/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, content, mood, title } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
  }

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  // Make sure this entry belongs to the user
  const existing = await prisma.journalEntry.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.journalEntry.update({
    where: { id },
    data: {
      content: content.trim(),
      mood: mood ?? "same",
      title: title?.trim() || null,
    },
  });

  return NextResponse.json({ success: true, entry: updated });
}