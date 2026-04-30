/**
 * @file app/register/page.tsx
 * @description Premium registration page with split layout.
 * Calls the real FastAPI backend POST /api/v1/auth/register endpoint,
 * then auto-signs in via NextAuth and redirects to /dashboard.
 */
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  BarChart2, Eye, EyeOff, Loader2, ArrowLeft,
  Brain, Zap, ShieldCheck, CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import CosmicBackground from "@/components/CosmicBackground"

const PERKS = [
  { icon: Brain,       text: "XGBoost + LSTM hybrid ML engine"        },
  { icon: Zap,         text: "Sub-50ms order execution via WebSocket"  },
  { icon: ShieldCheck, text: "Advanced risk controls — built-in safety" },
]

const PASSWORD_RULES = [
  { label: "At least 8 characters",   test: (v: string) => v.length >= 8              },
  { label: "One uppercase letter",     test: (v: string) => /[A-Z]/.test(v)            },
  { label: "One number",              test: (v: string) => /\d/.test(v)               },
]

export default function RegisterPage() {
  const router = useRouter()

  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Client-side validation
    if (passwordStrength < PASSWORD_RULES.length) {
      setError("Password does not meet all requirements.")
      return
    }

    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

      // Step 1: Register via FastAPI
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.detail ?? "Registration failed. Please try again.")
        setLoading(false)
        return
      }

      // Step 2: Auto sign-in via NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        // Registration succeeded but sign-in failed — send to login
        router.push("/login?registered=1")
      }
    } catch {
      setError("Network error. Please check your connection.")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-neutral-200">
      <CosmicBackground />
      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">

        {/* ── Left Panel — Branding ────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between p-12 text-white relative border-r border-white/10 bg-black/10 backdrop-blur-sm animate-in fade-in slide-in-from-left-8 duration-[1500ms] ease-out fill-mode-both">
          
          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-500 flex items-center justify-center shadow-lg">
              <BarChart2 className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">OrderBookExpert</span>
          </div>

          {/* Main content */}
          <div className="relative space-y-8">
            <div>
              <h2 className="text-4xl font-extrabold leading-tight">
                Start Trading Smarter,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">
                  Powered by AI.
                </span>
              </h2>
              <p className="mt-4 text-slate-400 text-lg leading-relaxed">
                Create your free account and get instant access to the most advanced
                Level 2 order book trading system available.
              </p>
            </div>

          <div className="space-y-4">
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <p.icon className="h-4 w-4 text-neutral-300" />
                </div>
                <span className="text-sm text-slate-300">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative">
          <div className="rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-600 flex items-center justify-center text-sm font-bold text-black shrink-0">
                ✓
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Free to get started</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  No credit card required. Connect your exchange API key to begin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Register Form ───────────────── */}
      <div className="flex flex-col items-center justify-center bg-black/20 backdrop-blur-xl p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-[1500ms] ease-out delay-300 fill-mode-both">
        <div className="w-full max-w-md space-y-8">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Create your account
            </h1>
            <p className="mt-2 text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-white hover:text-neutral-300 transition-colors underline decoration-white/30 underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="block text-sm font-medium text-slate-300">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice Johnson"
                className="block w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@example.com"
                className="block w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  {/* Strength bar */}
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength
                            ? passwordStrength === 1
                              ? "bg-neutral-600"
                              : passwordStrength === 2
                              ? "bg-neutral-400"
                              : "bg-white"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  {/* Rules checklist */}
                  <div className="space-y-1">
                    {PASSWORD_RULES.map((rule) => (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 transition-colors ${
                            rule.test(password)
                              ? "text-white"
                              : "text-slate-500"
                          }`}
                        />
                        <span className={`text-xs transition-colors ${
                          rule.test(password)
                            ? "text-white"
                            : "text-slate-500"
                        }`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold py-3 text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] h-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account & Start Trading"
              )}
            </Button>

            <p className="text-center text-xs text-slate-400">
              By creating an account you agree to our{" "}
              <span className="underline cursor-pointer hover:text-white transition-colors">Terms of Service</span>.
            </p>
          </form>
        </div>
        </div>
      </div>
    </div>
  )
}
