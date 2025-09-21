"use client";

import { useState } from "react";
import {
  CalendarDays,
  Save,
  XCircle,
  BookOpen,
  Clock,
  FileText,
  AlertTriangle,
  GraduationCap,
  BarChart3,
  Timer,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const subjects = [
  { value: "Mathematics", label: "Mathematics", icon: BarChart3 },
  { value: "Physics", label: "Physics", icon: Timer },
  { value: "Chemistry", label: "Chemistry", icon: GraduationCap },
  { value: "Literature", label: "Literature", icon: BookOpen },
  { value: "History", label: "History", icon: FileText },
  { value: "Computer Science", label: "Computer Science", icon: GraduationCap },
  { value: "Biology", label: "Biology", icon: GraduationCap },
  { value: "Other", label: "Other", icon: GraduationCap },
];

const priorities = [
  {
    value: "low",
    label: "Low",
    color: "text-green-400 border-green-400/30 bg-green-500/10",
  },
  {
    value: "medium",
    label: "Medium",
    color: "text-yellow-400 border-yellow-400/30 bg-yellow-500/10",
  },
  {
    value: "high",
    label: "High",
    color: "text-red-400 border-red-400/30 bg-red-500/10",
  },
];

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
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "Other",
    priority: "medium",
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (f: string, v: string) =>
    setForm((p) => ({ ...p, [f]: v }));

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.startTime || !form.endTime) return "Start and end times required";
    if (new Date(form.startTime) >= new Date(form.endTime))
      return "End must be after start";
    if (new Date(form.startTime) < new Date()) return "Start must be in future";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error((await res.json()).error);
      onCreated();
      onClose();
      setForm({ ...form, title: "", description: "", startTime: "", endTime: "" });
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const SubjectIcon =
    subjects.find((s) => s.value === form.subject)?.icon || GraduationCap;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-cyan-400/20 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Create Study Block</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-2">
              <AlertTriangle className="w-5 h-5" /> {error}
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Study Block Title *"
            className="w-full bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400"
            required
          />

          {/* Description */}
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 resize-none"
          />

          {/* Subject + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white">Subject</label>
              <div className="relative">
                <SubjectIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded pl-10 pr-3 py-2 text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.value} value={s.value} className="bg-gray-800">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-white">Priority</label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleChange("priority", p.value)}
                    className={`flex-1 mt-2  px-2 py-1 rounded border text-xs ${
                      form.priority === p.value
                        ? p.color
                        : "bg-white/5 border-white/20 text-gray-400"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            {["startTime", "endTime"].map((f) => (
              <div key={f}>
                <label className="text-sm text-white">
                  {f === "startTime" ? "Start Time *" : "End Time *"}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={form[f as "startTime" | "endTime"]}
                    onChange={(e) => handleChange(f, e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded pl-10 pr-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Duration */}
          {form.startTime && form.endTime && (
            <div className="flex items-center gap-2 text-cyan-400 text-sm bg-cyan-500/10 p-2 rounded border border-cyan-400/20">
              <Timer className="w-4 h-4" />
              Duration:{" "}
              {Math.round(
                (new Date(form.endTime).getTime() -
                  new Date(form.startTime).getTime()) /
                  60000
              )}{" "}
              minutes
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-white/5 border border-white/20 text-gray-400 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>{loading ? "Creating..." : "Create Block"}</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
