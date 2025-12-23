"use client";

/**
 * Signup Page
 * 
 * New users can create an account here.
 */

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Create the account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Auto-login after signup
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Account created but login failed - redirect to login
        router.push("/login");
      } else {
        // Success! Redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Leaf className="w-8 h-8 text-garden-500" />
            <span className="font-display text-2xl font-bold">Mind Garden</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold mb-2">
              Start your garden
            </h2>
            <p className="text-[var(--muted)]">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-12 pr-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-12 pr-12 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-garden-600 hover:bg-garden-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-8 text-center text-[var(--muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-garden-600 hover:text-garden-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-garden-900 via-garden-800 to-garden-950 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-40 right-20 w-80 h-80 bg-warmth-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-40 left-20 w-64 h-64 bg-garden-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Leaf className="w-12 h-12 text-garden-300" />
            <span className="font-display text-4xl font-bold">Mind Garden</span>
          </div>
          
          <h1 className="text-3xl font-display text-center mb-8">
            What you&apos;ll get
          </h1>

          <div className="space-y-4 max-w-sm">
            {[
              { icon: "🎯", text: "PARA organization system" },
              { icon: "📝", text: "Beautiful page editor" },
              { icon: "✅", text: "Task and habit tracking" },
              { icon: "📊", text: "Custom databases" },
              { icon: "🌙", text: "Dark & light themes" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2 text-garden-200">
            <Sparkles className="w-5 h-5" />
            <span>AI features coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

