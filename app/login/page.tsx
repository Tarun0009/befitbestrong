"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/account");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <Dumbbell className="w-7 h-7 text-[#FF5500]" />
        <span className="font-(family-name:--font-bebas-neue) text-3xl tracking-wider">BeFitBeStrong</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-8">
          <h1 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide mb-1">
            Welcome Back
          </h1>
          <p className="text-[#8E8E93] text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#8E8E93]/50"
              />
            </div>

            <div>
              <label className="block text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#2C2C2E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-4 py-3 pr-11 text-sm outline-none transition-colors placeholder:text-[#8E8E93]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#F2F2F7] transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link href="/forgot-password" className="text-[#8E8E93] hover:text-[#FF5500] text-xs transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5500] hover:bg-[#CC4400] disabled:opacity-60 text-white font-bold uppercase tracking-widest py-3.5 rounded-lg transition-colors text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[#8E8E93] text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#FF5500] hover:text-[#CC4400] font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
