import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";
import connectDB from "@/lib/mongoose";
import { StudyBlock } from "@/models/StudyBlock";

// ✅ Supabase client (anon key is enough for verifying JWTs)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ------------------------
// 🔐 Auth helper
// ------------------------
type AuthResult =
  | { user: User }
  | { error: string; status: number };

async function authenticateUser(request: Request): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return { error: "Missing or invalid authorization header", status: 401 };
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return { error: "Invalid or expired token", status: 401 };
    }

    return { user: data.user };
  } catch (e) {
    console.error("Authentication error:", e);
    return { error: "Authentication failed", status: 500 };
  }
}

// ------------------------
// ✅ GET /api/blocks
// ------------------------
export async function GET(request: Request) {
  try {
    await connectDB();

    const auth = await authenticateUser(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const user = auth.user;

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const sortBy = url.searchParams.get("sortBy") || "startTime";
    const order = url.searchParams.get("order") === "desc" ? -1 : 1;
    const filter = url.searchParams.get("filter"); // upcoming, past, active

    let query: any = { userId: user.id };
    const now = new Date();

    // Apply filters
    switch (filter) {
      case "upcoming":
        query.startTime = { $gt: now };
        break;
      case "past":
        query.endTime = { $lt: now };
        break;
      case "active":
        query.startTime = { $lte: now };
        query.endTime = { $gte: now };
        break;
    }

    const blocks = await StudyBlock.find(query)
      .sort({ [sortBy]: order })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await StudyBlock.countDocuments(query);

    // Add computed fields
    const enrichedBlocks = blocks.map((block: any) => ({
      ...block,
      isActive: now >= new Date(block.startTime) && now <= new Date(block.endTime),
      isUpcoming: now < new Date(block.startTime),
      durationMinutes: Math.round(
        (new Date(block.endTime).getTime() - new Date(block.startTime).getTime()) /
          (1000 * 60)
      ),
    }));

    return NextResponse.json({
      blocks: enrichedBlocks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("GET /api/blocks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch study blocks" },
      { status: 500 }
    );
  }
}

// ------------------------
// ✅ POST /api/blocks
// ------------------------
export async function POST(request: Request) {
  try {
    await connectDB();

    const auth = await authenticateUser(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const user = auth.user;

    const body = await request.json();
    const {
      title,
      description = "",
      subject = "Other",
      priority = "medium",
      startTime,
      endTime,
    } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start and End times are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Overlap check
    // @ts-ignore
    const overlap = await StudyBlock.findOverlapping(user.id, startDate, endDate);
    if (overlap) {
      return NextResponse.json(
        {
          error: "This time slot overlaps with an existing study block",
          conflictingBlock: {
            title: overlap.title,
            startTime: overlap.startTime,
            endTime: overlap.endTime,
          },
        },
        { status: 400 }
      );
    }

    // Create block
    const block = await StudyBlock.create({
      userId: user.id,
      userEmail: user.email,
      title: title.trim(),
      description: description.trim(),
      subject,
      priority,
      startTime: startDate,
      endTime: endDate,
    });

    const enrichedBlock = {
      ...block.toObject(),
      isActive: false,
      isUpcoming: true,
      durationMinutes: block.getDurationMinutes(),
    };

    return NextResponse.json(
      { block: enrichedBlock, message: "Study block created successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/blocks error:", err);

    if (err instanceof Error && err.name === "ValidationError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create study block" },
      { status: 500 }
    );
  }
}
