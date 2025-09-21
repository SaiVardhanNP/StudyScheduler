"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type StudyBlock = {
  _id: string;
  startTime: string;
  endTime: string;
  reminderSent: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/signin");
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await fetch("/api/blocks");
        if (res.ok) {
          const data = await res.json();
          setBlocks(data.blocks);
        }
      } catch (err) {
        console.error("Failed to fetch blocks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] relative">
      {/* Cyan Radial Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 600px at 50% 100px, rgba(6,182,212,0.4), transparent)`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-6 py-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-cyan-300">QuietHours</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 py-10 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white mb-6">📚 Your Study Blocks</h2>

        {loading && (
          <p className="text-white/70 text-center">Loading your blocks...</p>
        )}

        {!loading && blocks.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-white/70 mb-4 text-lg">📭 No study blocks yet.</p>
            <button
              onClick={() => router.push("/create-block")}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md transition"
            >
              + Create Block
            </button>
          </div>
        )}

        {!loading && blocks.length > 0 && (
          <div className="w-full max-w-2xl">
            <div className="flex justify-end mb-6">
              <button
                onClick={() => router.push("/create-block")}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md transition"
              >
                + Create Block
              </button>
            </div>

            <ul className="space-y-4">
              {blocks.map((block) => (
                <li
                  key={block._id}
                  className="p-4 bg-white/10 border border-white/20 rounded-lg shadow flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm text-white">
                      <span className="font-semibold text-cyan-300">Start:</span>{" "}
                      {new Date(block.startTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-white">
                      <span className="font-semibold text-cyan-300">End:</span>{" "}
                      {new Date(block.endTime).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      block.reminderSent
                        ? "bg-green-500/20 text-green-300 border border-green-300/30"
                        : "bg-yellow-500/20 text-yellow-300 border border-yellow-300/30"
                    }`}
                  >
                    {block.reminderSent ? "Reminder Sent" : "Scheduled"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
