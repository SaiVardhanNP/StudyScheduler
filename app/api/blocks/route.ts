import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import connectDB from "@/lib/mongoose";
import { StudyBlock } from "@/models/StudyBlock";

// ✅ GET /api/blocks → list all blocks for user
export async function GET(req: Request) {
  await connectDB();

  const supabaseToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!supabaseToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const blocks = await StudyBlock.find({ userId: user.id }).sort({ startTime: 1 });
  return NextResponse.json({ blocks });
}

// ✅ POST /api/blocks → create new block
export async function POST(req: Request) {
  await connectDB();

  const supabaseToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!supabaseToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const { startTime, endTime } = body;

  if (!startTime || !endTime) {
    return NextResponse.json({ error: "Start and End times are required" }, { status: 400 });
  }

  // Overlap check
  const overlap = await StudyBlock.findOne({
    userId: user.id,
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  });

  if (overlap) {
    return NextResponse.json({ error: "Block overlaps with an existing one" }, { status: 400 });
  }

  const block = await StudyBlock.create({
    userId: user.id,
    startTime,
    endTime,
  });

  return NextResponse.json({ block }, { status: 201 });
}
