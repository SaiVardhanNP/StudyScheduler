import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { StudyBlock } from "@/models/StudyBlock";
import { supabase } from "@/lib/supabase";
import nodemailer from "nodemailer";

// ✅ Setup mailer (replace with SendGrid/Resend for production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS, // Gmail app password
  },
});

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const in10Min = new Date(now.getTime() + 10 * 60 * 1000);

    // Find blocks starting in the next 10 min
    const blocks = await StudyBlock.find({
      startTime: { $gte: now, $lte: in10Min },
      reminderSent: false,
    });

    for (const block of blocks) {
      // Get user email from Supabase
      const { data, error } = await supabase.auth.admin.getUserById(block.userId);
      if (error || !data?.user) continue;

      const email = data.user.email;
      if (!email) continue;

      // Send email
      await transporter.sendMail({
        from: `"QuietHours" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "⏰ Your study block starts soon!",
        text: `Reminder: Your study block starts at ${new Date(
          block.startTime
        ).toLocaleString()}.`,
      });

      // Mark reminder as sent
      block.reminderSent = true;
      await block.save();

      console.log(`📧 Reminder sent to ${email}`);
    }

    return NextResponse.json({ success: true, sent: blocks.length });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
