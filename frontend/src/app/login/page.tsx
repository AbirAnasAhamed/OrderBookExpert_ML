/**
 * @file app/login/page.tsx
 * @description Premium login page with split layout.
 * Left panel: branding & testimonial. Right panel: login form.
 * Uses NextAuth signIn with credentials provider.
 */
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart2, Eye, EyeOff, Loader2, ArrowLeft, Brain, Zap, ShieldCheck, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import CosmicBackground from "@/components/CosmicBackground"

const HIGHLIGHTS = [
  { icon: Brain,       text: "XGBoost + LSTM hybrid ML engine"          },
  { icon: Zap,         text: "Sub-50ms order execution via WebSocket"    },
  { icon: ShieldCheck, text: "Advanced risk controls — built-in safety"  },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  const [success, setSuccess]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1500)
    } else {
      setLoading(false)
      setError("Invalid email or password. Please try again.")
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

          {/* Main Content */}
          <div className="relative space-y-8">
            <div>
              <h2 className="text-4xl font-extrabold leading-tight">
                Your AI Trading Bot,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">
                  Always On.
                </span>
            </h2>
            <p className="mt-4 text-slate-400 text-lg leading-relaxed">
              Sign in to access your autonomous trading dashboard, control the bot,
              monitor live order book data, and review performance analytics.
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <h.icon className="h-4 w-4 text-neutral-300" />
                </div>
                <span className="text-sm text-slate-300">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative">
          <div className="rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md p-5">
            <p className="text-sm text-slate-300 leading-relaxed italic">
              &ldquo;The order book tells a story that candlesticks can&apos;t. This system reads it better than any human trader.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-600 flex items-center justify-center text-xs font-bold text-black">Q</div>
              <div>
                <p className="text-xs font-semibold text-white">Quant Research Team</p>
                <p className="text-xs text-slate-400">Internal Testing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ─────────────────── */}
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

          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-white hover:text-neutral-300 transition-colors underline decoration-white/30 underline-offset-4"
              >
                Create one free
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@obe.io"
                className="block w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
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
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold py-3 text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] h-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>

            {/* Register link */}
            <p className="text-center text-sm text-slate-400">
              New to OrderBookExpert?{" "}
              <Link
                href="/register"
                className="font-semibold text-white hover:text-neutral-300 transition-colors underline decoration-white/30 underline-offset-4"
              >
                Create a free account
              </Link>
            </p>
          </form>
        </div>
      </div>
      </div>{/* close grid */}

      {/* ── Success Transition Overlay ─────────────────── */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-in fade-in duration-700">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes load-progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            .animate-load-progress {
              animation: load-progress 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
          `}} />
          <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
            <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md relative overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <Activity className="h-10 w-10 text-white animate-pulse relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold tracking-widest text-white uppercase">Authentication Verified</h3>
              <p className="text-sm text-neutral-400 font-mono tracking-wider">INITIALIZING NEURAL DASHBOARD...</p>
            </div>
            {/* Progress bar */}
            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-white rounded-full animate-load-progress" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
