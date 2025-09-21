"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name,setName]=useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options:{
        data:{
            name
        }
      }
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

      {/* Signup Form */}
      <form
        onSubmit={handleSignup}
        className="relative z-10 bg-white/5 backdrop-blur-md border border-cyan-400/30 p-6 sm:p-8 rounded-xl shadow-lg w-[90%] max-w-md text-white animate-fade-in"
      >
        <h1 className="text-3xl font-bold mb-2 text-center text-cyan-300">Sign Up</h1>
        <p className="text-md text-gray-400 text-center mb-6">
          Create your account to start scheduling study blocks
        </p>

        {error && <p className="text-red-400 mb-4 text-sm text-center">{error}</p>}

        <div className="space-y-4">

            <input
            type="name"
            placeholder="Name"
            className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Extra Links */}
        <p className="mt-6 text-md text-center text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="text-cyan-400 hover:underline"
          >
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}
