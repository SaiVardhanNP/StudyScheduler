import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";
import connectDB from "@/lib/mongoose";
import { StudyBlock } from "@/models/StudyBlock";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AuthResult = { user: User } | { error: string; status: number };

type BlockLean = {
  _id: string;
  userId: string;
  startTime: string | Date;
  endTime: string | Date;
  [key: string]: any;
};

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
  } catch (err) {
    console.error("Authentication error:", err);
    return { error: "Authentication failed", status: 500 };
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const auth = await authenticateUser(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const user = auth.user;

    const block = await StudyBlock.findOne({
      _id: params.id,
      userId: user.id,
    }).lean<BlockLean>();

    if (!block) {
      return NextResponse.json({ error: "Study block not found" }, { status: 404 });
    }

    const now = new Date();
    const start = new Date(block.startTime);
    const end = new Date(block.endTime);

    const enrichedBlock = {
      ...block,
      isActive: now >= start && now <= end,
      isUpcoming: now < start,
      durationMinutes: Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
    };

    return NextResponse.json({ block: enrichedBlock });
  } catch (error) {
    console.error("GET /api/blocks/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch study block" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const auth = await authenticateUser(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const user = auth.user;

    const body = await request.json();
    const { title, description, subject, priority, startTime, endTime } = body;

    const existingBlock = await StudyBlock.findOne({
      _id: params.id,
      userId: user.id,
    }).lean<BlockLean>();

    if (!existingBlock) {
      return NextResponse.json({ error: "Study block not found" }, { status: 404 });
    }

    const existingEnd = new Date(existingBlock.endTime);
    if (existingEnd < new Date()) {
      return NextResponse.json(
        { error: "Cannot modify completed study blocks" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (subject !== undefined) updateData.subject = subject;
    if (priority !== undefined) updateData.priority = priority;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);

    if (startTime || endTime) {
      const newStart = startTime ? new Date(startTime) : new Date(existingBlock.startTime);
      const newEnd = endTime ? new Date(endTime) : new Date(existingBlock.endTime);

      // @ts-ignore static method not typed
      const overlap = await StudyBlock.findOverlapping(user.id, newStart, newEnd, params.id);
      if (overlap) {
        return NextResponse.json(
          {
            error: "Updated time slot overlaps with an existing study block",
            conflictingBlock: {
              title: overlap.title,
              startTime: overlap.startTime,
              endTime: overlap.endTime,
            },
          },
          { status: 400 }
        );
      }
    }

    const updatedBlock = await StudyBlock.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).lean<BlockLean>();

    if (!updatedBlock) {
      return NextResponse.json({ error: "Failed to update block" }, { status: 400 });
    }

    const now = new Date();
    const start = new Date(updatedBlock.startTime);
    const end = new Date(updatedBlock.endTime);

    const enrichedBlock = {
      ...updatedBlock,
      isActive: now >= start && now <= end,
      isUpcoming: now < start,
      durationMinutes: Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
    };

    return NextResponse.json({
      block: enrichedBlock,
      message: "Study block updated successfully",
    });
  } catch (error: any) {
    console.error("PUT /api/blocks/[id] error:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update study block" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const auth = await authenticateUser(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = auth.user.id;
    const block = await StudyBlock.findOne({
      _id: params.id,
      userId,
    });

    if (!block) {
      return NextResponse.json(
        { error: "Study block not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const start = new Date(block.startTime);
    const end = new Date(block.endTime);

    const isActive = now >= start && now <= end;
    const isPast = end < now;

    if (isActive) {
      return NextResponse.json(
        {
          error:
            "Cannot delete an active study block. Please wait until it ends.",
        },
        { status: 400 }
      );
    }

    await StudyBlock.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      id: params.id,
      message: isPast
        ? "Completed study block deleted successfully"
        : "Upcoming study block deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/blocks/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete study block" },
      { status: 500 }
    );
  }
}
