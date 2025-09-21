"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import CreateBlockModal from "@/components/CreateBlockModal";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) fetchBlocks();
  }, [user]);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      window.location.href = "/signin";
      return;
    }
    const displayName = data.user.user_metadata?.name || "";
    setName(displayName);
    setUser(data.user);
  };

  const fetchBlocks = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    const res = await fetch("/api/blocks", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setBlocks(data.blocks || []);
    setLoading(false);
  };

  const handleDelete = async (blockId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await fetch(`/api/blocks/${blockId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setBlocks((prev) => prev.filter((b) => b._id !== blockId));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  const totalHours = blocks.reduce((acc, block) => {
    const duration =
      (new Date(block.endTime).getTime() -
        new Date(block.startTime).getTime()) /
      (1000 * 60 * 60);
    return acc + duration;
  }, 0);

  const completedBlocks = blocks.filter(
    (b) => new Date(b.endTime) < new Date()
  ).length;
  const upcomingBlocks = blocks.filter(
    (b) => new Date(b.startTime) > new Date()
  ).length;

  return (
    <div className="min-h-screen w-full bg-[#020617] relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full border border-cyan-400 bg-cyan-500/10">
              <BookOpen className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="text-xl font-bold text-cyan-400">
              QuietHours
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-gray-400 hidden sm:block text-sm truncate max-w-[150px] sm:max-w-xs">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 sm:px-4 py-2 rounded-lg hover:bg-red-500/20 transition"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome + Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            Welcome back {name || "Student"}! 👋
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group max-sm:mx-auto flex  items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 sm:px-6 py-3 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            Create Study Block
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="p-4 bg-white/5 rounded-xl text-white text-center">
            <Layers className="h-5 w-5 mx-auto mb-2 text-cyan-400" />
            <p className="text-lg font-semibold">{blocks.length}</p>
            <p className="text-gray-400 text-sm">Total Blocks</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-white text-center">
            <Clock className="h-5 w-5 mx-auto mb-2 text-cyan-400" />
            <p className="text-lg font-semibold">{totalHours.toFixed(1)}h</p>
            <p className="text-gray-400 text-sm">Study Hours</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-white text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-400" />
            <p className="text-lg font-semibold">{completedBlocks}</p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-white text-center">
            <AlertCircle className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
            <p className="text-lg font-semibold">{upcomingBlocks}</p>
            <p className="text-gray-400 text-sm">Upcoming</p>
          </div>
        </div>

        {/* Blocks Section */}
        {loading && <p className="text-cyan-400">Loading blocks...</p>}

        {!loading && blocks.length === 0 && (
          <p className="text-gray-400 text-center sm:text-left">
            No study blocks yet. Create your first one!
          </p>
        )}

        {!loading && blocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {blocks.map((b) => (
              <div
                key={b._id}
                className="p-4 bg-white/5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base sm:text-lg">
                    {b.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{b.subject}</p>
                </div>
                <button
                  onClick={() => handleDelete(b._id)}
                  className="text-red-400 hover:text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <CreateBlockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={() => {
            fetchBlocks();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
