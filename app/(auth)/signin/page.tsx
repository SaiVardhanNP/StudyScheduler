"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] relative flex items-center justify-center">
      {/* Cyan Radial Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(6,182,212,0.4), transparent)`,
        }}
      />

      {/* Sign-in Form */}
      <form
        onSubmit={handleSignin}
        className="relative z-10 bg-white/5 backdrop-blur-md border border-cyan-400/30 p-6 sm:p-8 rounded-xl shadow-lg w-[90%] max-w-md text-white animate-fade-in"
      >
        <h1 className="text-3xl font-bold mb-2 text-center text-cyan-300">
          Sign In
        </h1>
        <p className="text-md text-gray-400 text-center mb-6">
          Welcome back! Log in to access your dashboard
        </p>

        {error && (
          <p className="text-red-400 mb-4 text-sm text-center">{error}</p>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-md transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Extra Links */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-md text-cyan-400 hover:underline text-center"
          >
            New user? Create an account
          </button>
        </div>
      </form>
    </div>
  );
}
