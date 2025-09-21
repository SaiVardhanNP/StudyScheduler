"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Calendar,
  Plus,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Timer,
  GraduationCap,
  BarChart3,
  Settings,
  Bell,
  Play,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------
// Study Block Card
// ---------------------
const StudyBlockCard = ({ block, onDelete }: any) => {
  const startTime = new Date(block.startTime);
  const endTime = new Date(block.endTime);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  const isUpcoming = startTime > new Date();
  const isActive = new Date() >= startTime && new Date() <= endTime;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-green-500/10 border-green-500/20 text-green-400";
      default:
        return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case "Mathematics":
        return <BarChart3 className="h-4 w-4" />;
      case "Physics":
        return <Timer className="h-4 w-4" />;
      case "Literature":
      case "History":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${block.title}"?`)) {
      onDelete(block._id);
    }
  };

  return (
    <div
      className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        isActive
          ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400/40 shadow-lg shadow-cyan-500/20"
          : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
      }`}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-cyan-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Play className="h-3 w-3" />
            ACTIVE
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getPriorityColor(block.priority)}`}>
            {getSubjectIcon(block.subject)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
              {block.title}
            </h3>
            {block.description && (
              <p className="text-sm text-gray-400 mb-2">{block.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`px-2 py-1 rounded-full font-medium capitalize ${getPriorityColor(
                  block.priority
                )}`}
              >
                {block.priority} priority
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{block.subject}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-cyan-400" />
          <span className="text-gray-300">{startTime.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-cyan-400" />
          <span className="text-gray-300">
            {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4 text-cyan-400" />
          <span className="text-gray-300">{duration} min</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {block.reminderSent ? (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Reminder sent</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-yellow-400 text-sm">
              <Bell className="h-4 w-4" />
              <span>Reminder pending</span>
            </div>
          )}
        </div>

        {isUpcoming && (
          <div className="text-xs text-gray-400">
            Starts in {Math.ceil((startTime.getTime() - Date.now()) / (1000 * 60 * 60))}h
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------
// Stats Card
// ---------------------
const StatsCard = ({ icon, label, value, trend, color = "cyan" }: any) => {
  const colorClasses: any = {
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };

  return (
    <div
      className={`p-4 rounded-xl border ${colorClasses[color]} bg-white/5 hover:bg-white/8 transition-colors`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${colorClasses[color]}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
};

// ---------------------
// Dashboard Page
// ---------------------
export default function DashboardPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) fetchBlocks();
  }, [user]);

  const checkAuth = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setError("Please sign in to continue");
      window.location.href = "/signin";
      return;
    }
    setUser(data.user);
  };

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) throw new Error("No valid session found");

      const res = await fetch("/api/blocks", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch blocks");

      const data = await res.json();
      setBlocks(data.blocks || []);
    } catch (err: any) {
      setError(err.message || "Failed to load blocks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blockId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    try {
      const res = await fetch(`/api/blocks/${blockId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setBlocks((prev) => prev.filter((b) => b._id !== blockId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete block");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  const totalHours = blocks.reduce((acc, block) => {
    const duration =
      (new Date(block.endTime).getTime() - new Date(block.startTime).getTime()) /
      (1000 * 60 * 60);
    return acc + duration;
  }, 0);

  const completedBlocks = blocks.filter((b) => new Date(b.endTime) < new Date()).length;
  const upcomingBlocks = blocks.filter((b) => new Date(b.startTime) > new Date()).length;

  return (
    <div className="min-h-screen w-full bg-[#020617] relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full border border-cyan-400 bg-cyan-500/10">
              <BookOpen className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="text-xl font-bold text-cyan-400">QuietHours</span>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-gray-400 text-sm">{user.email}</span>}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-white mb-6">Welcome back 👋</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard icon={<BookOpen />} label="Total Blocks" value={blocks.length} />
          <StatsCard
            icon={<Clock />}
            label="Study Hours"
            value={`${totalHours.toFixed(1)}h`}
            color="green"
          />
          <StatsCard
            icon={<CheckCircle2 />}
            label="Completed"
            value={completedBlocks}
            color="purple"
          />
          <StatsCard icon={<AlertCircle />} label="Upcoming" value={upcomingBlocks} color="yellow" />
        </div>

        {loading && <p className="text-cyan-400">Loading blocks...</p>}

        {!loading && blocks.length === 0 && (
          <p className="text-gray-400">No study blocks yet. Create your first one!</p>
        )}

        {!loading && blocks.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {blocks.map((b) => (
              <StudyBlockCard key={b._id} block={b} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
