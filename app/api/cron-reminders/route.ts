import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { StudyBlock } from "@/models/StudyBlock";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials not configured in .env.local");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const generateEmailHTML = (block: any, name: string) => `
  <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Geist', sans-serif;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">🎯 Time to Lock In</h1>
<p style="margin-top: 8px; font-size: 16px;">Hey ${name}, it’s almost time to tune out distractions and dive in.</p>
        </div>

        <!-- Block Details -->
        <div style="padding: 24px;">
          <h2 style="margin-bottom: 12px; font-size: 20px; color: #0f172a;">${
            block.title
          }</h2>
          <table style="width: 100%; font-size: 16px; color: #334155;">
            <tr>
              <td style="padding: 6px 0;"><strong>📘 Subject:</strong></td>
              <td style="padding: 6px 0;">${block.subject}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>⭐ Priority:</strong></td>
              <td style="padding: 6px 0;">${block.priority}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>🕒 Starts:</strong></td>
              <td style="padding: 6px 0;">${new Date(
                block.startTime
              ).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>🕔 Ends:</strong></td>
              <td style="padding: 6px 0;">${new Date(
                block.endTime
              ).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>⏳ Duration:</strong></td>
              <td style="padding: 6px 0;">${Math.round(
                (new Date(block.endTime).getTime() -
                  new Date(block.startTime).getTime()) /
                  60000
              )} minutes</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 13px; color: #64748b;">
          <p style="margin: 0;">This reminder was sent by <strong>QuietHours</strong> — stay focused, stay consistent.</p>
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
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(
        block.userId
      );

      if (error || !data?.user?.email) {
        errors.push({ blockId: block._id, error: "User email not found" });
        continue;
      }

      const email = data.user.email;
      const name = data?.user?.user_metadata.name;

      await transporter.sendMail({
        from: `"QuietHours" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🤫 Study Time: "${block.title}" starts soon`,
        html: generateEmailHTML(block, name),
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
  const expectedAuth = `Bearer ${
    process.env.CRON_SECRET || "your-cron-secret"
  }`;

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
