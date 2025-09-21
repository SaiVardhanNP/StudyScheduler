"use client";

import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  BookOpen,
  CalendarPlus,
  AlarmClock,
  BarChart3,
  NotebookPen,
  Bell,
  LineChart,
  Gift,
} from "lucide-react"; 

export default function LandingPage() {
  const router = useRouter();

  const scrollToLearnMore = () => {
    const el = document.getElementById("learn-more");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] relative text-white">
      {/* 🔹 Cyan Radial Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(6,182,212,0.4), transparent)`,
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full px-8 py-4 flex items-center justify-between bg-transparent">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full border border-cyan-400 bg-cyan-500/10">
              <BookOpen className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-cyan-400">
              QuietHours
            </span>
          </div>
          <button
            onClick={() => router.push("/signin")}
            className="px-4 py-2 border border-cyan-400 rounded-lg hover:bg-cyan-500/20 transition flex items-center gap-2"
          >
            Sign In
          </button>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center py-20 px-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-5xl leading-tight">
              Turn Study Time Into
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Success Time
              </span>
            </h1>
          <p className="text-lg text-gray-300 mt-6 max-w-2xl">
            QuietHours helps you schedule study sessions, block distractions,
            and stay productive — effortlessly.
          </p>
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push("/signup")}
              className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg shadow hover:bg-cyan-400 transition"
            >
              Get Started
            </button>
            <button
              onClick={scrollToLearnMore}
              className="px-6 py-3 border border-cyan-400 rounded-lg hover:bg-cyan-500/20 transition"
            >
              Learn More
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyan-400">
            Why Choose QuietHours?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Smart Scheduling",
                desc: "Plan your quiet hours with ease and never miss a study block again.",
              },
              {
                title: "Focus Reminders",
                desc: "Get timely nudges so you stay on track with your goals.",
              },
              {
                title: "Analytics Dashboard",
                desc: "Track your progress and build productive habits over time.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-[#0f172a] border border-cyan-500/20 hover:border-cyan-400 transition text-center shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-2 text-cyan-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-16 bg-[#0f172a]/50">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyan-400">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
            <div>
              <CalendarPlus className="mx-auto h-10 w-10 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-cyan-300">
                1. Create Schedule
              </h3>
              <p className="text-gray-400">
                Add your study or focus blocks in just a few clicks.
              </p>
            </div>
            <div>
              <AlarmClock className="mx-auto h-10 w-10 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-cyan-300">
                2. Get Reminders
              </h3>
              <p className="text-gray-400">
                We’ll remind you before each session starts.
              </p>
            </div>
            <div>
              <BarChart3 className="mx-auto h-10 w-10 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-cyan-300">
                3. Track Progress
              </h3>
              <p className="text-gray-400">
                Monitor how consistent you’ve been over time.
              </p>
            </div>
          </div>
        </section>

        {/* Learn More */}
        <section id="learn-more" className="px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyan-400">
            Learn More
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-cyan-300 flex items-center gap-2">
                  <NotebookPen className="h-5 w-5" /> How do I create study blocks?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Simply sign up, head to your dashboard, and click “+ Create
                  Block”. Choose start and end times, and QuietHours will handle
                  the rest.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-cyan-300 flex items-center gap-2">
                  <Bell className="h-5 w-5" /> When will I get reminders?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  You’ll receive an email 10 minutes before your block starts.
                  This ensures you’re always ready to focus on time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-cyan-300 flex items-center gap-2">
                  <LineChart className="h-5 w-5" /> Can I track my progress?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Yes! Your dashboard shows all upcoming and past study blocks.
                  Analytics are coming soon to help you track consistency.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-cyan-300 flex items-center gap-2">
                  <Gift className="h-5 w-5" /> Is QuietHours free to use?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Absolutely! The core features are free. Premium options may
                  come later, but scheduling and reminders will always remain
                  free.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto py-8 text-center text-gray-400 border-t border-cyan-500/20">
          <p>
            &copy; {new Date().getFullYear()} QuietHours. Built with ❤️ by{" "}
            <span className="font-semibold text-cyan-400">VardhanNP</span>.
          </p>
        </footer>
      </div>
    </div>
  );
}
