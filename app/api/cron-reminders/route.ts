import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { StudyBlock } from "@/models/StudyBlock";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // ✅ Admin client
import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("❌ Email credentials not configured in .env.local");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // ✅ use correct vars
      pass: process.env.EMAIL_PASS,
    },
  });
};

const generateEmailHTML = (block: any, email: string) => `
  <html>
    <body style="font-family: sans-serif; line-height: 1.6; background-color: #f8fafc; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 20px; text-align: center; color: white;">
          <h1>⏰ Study Block Starting Soon!</h1>
          <p>Hey ${email}, get ready for your session.</p>
        </div>
        <div style="padding: 20px;">
          <h2>${block.title}</h2>
          <p><b>Subject:</b> ${block.subject}</p>
          <p><b>Priority:</b> ${block.priority}</p>
          <p><b>Starts:</b> ${new Date(block.startTime).toLocaleString()}</p>
          <p><b>Ends:</b> ${new Date(block.endTime).toLocaleString()}</p>
          <p><b>Duration:</b> ${Math.round(
            (new Date(block.endTime).getTime() - new Date(block.startTime).getTime()) / 60000
          )} min</p>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #666;">
          <p>This reminder was sent by <b>QuietHours</b></p>
        </div>
      </div>
    </body>
  </html>
`;

async function processReminders() {
  await connectDB();

  const now = new Date();
  const in10Min = new Date(now.getTime() + 10 * 60 * 1000);

  const blocks = await StudyBlock.find({
    startTime: { $gte: now, $lte: in10Min },
    reminderSent: false,
  });

  if (!blocks.length) {
    return { message: "No study blocks found", processed: 0, sent: 0 };
  }

  const transporter = createTransporter();
  let sent = 0;
  const errors: any[] = [];

  for (const block of blocks) {
    try {
      // ✅ Look up user email from Supabase
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(
        block.userId
      );

      if (error || !data?.user?.email) {
        errors.push({ blockId: block._id, error: "User email not found" });
        continue;
      }

      const email = data.user.email;

      await transporter.sendMail({
        from: `"QuietHours" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🤫 Study Time: "${block.title}" starts soon`,
        html: generateEmailHTML(block, email),
      });

      block.reminderSent = true;
      await block.save();

      sent++;
      console.log(`📧 Reminder sent to ${email}`);
    } catch (err: any) {
      console.error(`❌ Failed for block ${block._id}:`, err.message);
      errors.push({ blockId: block._id, error: err.message });
    }
  }

  return {
    message: `Processed ${blocks.length} blocks`,
    processed: blocks.length,
    sent,
    failed: errors.length,
    errors,
  };
}

// ✅ GET for manual browser test
export async function GET() {
  try {
    const result = await processReminders();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Cron GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST for production cron (secure)
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET || "your-cron-secret"}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processReminders();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Cron POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
