import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { StudyBlock } from "@/models/StudyBlock";
import { supabase } from "@/lib/supabase";

async function getUserFromToken(req: Request) {
  const supabaseToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!supabaseToken) return null;

  const { data, error } = await supabase.auth.getUser(supabaseToken);
  if (error || !data.user) return null;

  return data.user;
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ await params in Next.js 15
    const { id } = await context.params;

    const block = await StudyBlock.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/blocks/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
