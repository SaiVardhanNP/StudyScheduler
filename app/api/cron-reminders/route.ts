import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { StudyBlock } from "@/models/StudyBlock";
import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error("Email credentials not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

const generateEmailHTML = (block: any) => {
  const priorityColors: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
  };

  const subjectEmojis: Record<string, string> = {
    Mathematics: "📊",
    Physics: "⚛️",
    Literature: "📚",
    Chemistry: "🧪",
    Biology: "🧬",
    History: "📜",
    Other: "📖",
  };

  return `
    <html>
      <body style="font-family: sans-serif; line-height: 1.6; background-color: #f8fafc; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 20px; text-align: center; color: white;">
            <h1>⏰ Study Block Starting Soon!</h1>
            <p>Get ready for your focused learning session</p>
          </div>
          <div style="padding: 20px;">
            <h2>${subjectEmojis[block.subject] || "📖"} ${block.title}</h2>
            ${
              block.description
                ? `<p style="color:#555;">${block.description}</p>`
                : ""
            }
            <p><b>Subject:</b> ${block.subject}</p>
            <p><b>Priority:</b> <span style="color:${
              priorityColors[block.priority]
            }">${block.priority}</span></p>
            <p><b>Starts:</b> ${new Date(block.startTime).toLocaleString()}</p>
            <p><b>Ends:</b> ${new Date(block.endTime).toLocaleString()}</p>
            <p><b>Duration:</b> ${Math.round(
              (new Date(block.endTime).getTime() -
                new Date(block.startTime).getTime()) /
                (1000 * 60)
            )} min</p>
          </div>
          <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #666;">
            <p>This reminder was sent by <b>QuietHours</b></p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET || "your-cron-secret"}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
    const elevenMinutesLater = new Date(now.getTime() + 11 * 60 * 1000);

    const blocksToNotify = await StudyBlock.find({
      startTime: { $gte: tenMinutesLater, $lt: elevenMinutesLater },
      reminderSent: false,
    }).lean();

    if (blocksToNotify.length === 0) {
      return NextResponse.json({
        message: "No study blocks found that need notifications",
        processed: 0,
        sent: 0,
      });
    }

    let notificationsSent = 0;
    const errors: any[] = [];
    let transporter;

    try {
      transporter = createTransporter();
    } catch (err: any) {
      console.error("Failed to create email transporter:", err);
      return NextResponse.json(
        { error: "Email service not configured properly" },
        { status: 500 }
      );
    }

    for (const block of blocksToNotify) {
      try {
        await transporter.sendMail({
          from: `"QuietHours" <${process.env.GMAIL_USER}>`,
          to: block.userEmail,
          subject: `🤫 Study Time: "${block.title}" starts in 10 minutes`,
          html: generateEmailHTML(block),
          text: `
QuietHours Reminder

Your study block "${block.title}" starts in 10 minutes.
Subject: ${block.subject}
Priority: ${block.priority}
Start: ${new Date(block.startTime).toLocaleString()}
End: ${new Date(block.endTime).toLocaleString()}
          `.trim(),
        });

        await StudyBlock.findByIdAndUpdate(block._id, { reminderSent: true });
        notificationsSent++;
      } catch (emailErr: any) {
        console.error(`❌ Failed for block ${block._id}:`, emailErr);
        errors.push({ blockId: block._id, error: emailErr.message });
      }
    }

    return NextResponse.json({
      message: `Processed ${blocksToNotify.length} blocks`,
      processed: blocksToNotify.length,
      sent: notificationsSent,
      failed: errors.length,
      errors,
    });
  } catch (error: any) {
    console.error("CRON job error:", error);
    return NextResponse.json(
      { error: "Failed to process notifications", details: error.message },
      { status: 500 }
    );
  }
}
