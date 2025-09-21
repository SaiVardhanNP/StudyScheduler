import connectDB from "@/app/_lib/mongoose";
import { NextRequest, NextResponse } from "next/server";
export  async function GET(req: NextRequest ) {
  await connectDB();
  return NextResponse.json({
    msg:"Hello from Next.js"
  })
}
