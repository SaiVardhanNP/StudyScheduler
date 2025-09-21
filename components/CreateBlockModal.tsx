"use client";

import { useState } from "react";
import { CalendarDays, Save, XCircle } from "lucide-react";

type CreateBlockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateBlockModal({
  isOpen,
  onClose,
  onCreated,
}: CreateBlockModalProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime, endTime }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create block");
      } else {
        onCreated();
        onClose();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity">
      <div className="bg-white/5 border border-cyan-400/30 backdrop-blur-md rounded-xl p-6 sm:p-8 w-[90%] max-w-md shadow-xl text-white animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-cyan-300 flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            Create Study Block
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition"
            aria-label="Close modal"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <p className="text-red-400 mb-4 text-sm text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-white/70 mb-1">Start Time</label>
            <div className="flex items-center bg-white/10 border border-white/20 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-400">
              <CalendarDays className="h-5 w-5 text-white/50 mr-2" />
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-transparent w-full text-white placeholder-white/60 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">End Time</label>
            <div className="flex items-center bg-white/10 border border-white/20 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-400">
              <CalendarDays className="h-5 w-5 text-white/50 mr-2" />
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-transparent w-full text-white placeholder-white/60 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/10 transition"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
