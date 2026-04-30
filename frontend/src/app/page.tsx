"use client"

import Link from "next/link"
import { ArrowRight, BarChart2, Brain, Zap, ShieldCheck, Globe, TrendingUp, Sparkles, Activity } from "lucide-react"
import CosmicBackground from "@/components/CosmicBackground"

const FEATURES = [
  {
    icon: BarChart2,
    title: "Quantum Machine Learning Bot",
    description: "Real-time visualization of bids and asks. Our engine detects Buy Walls and Sell Walls milliseconds before the crowd, using hyper-dimensional mapping.",
    color: "from-cyan-500/20 to-blue-600/10",
    iconColor: "text-cyan-400",
    border: "border-cyan-500/30"
  },
  {
    icon: Brain,
    title: "Neural Synergy Matrix",
    description: "A dual-model AI combining fast tabular inference (XGBoost) with time-series momentum analysis (LSTM) for predictive accuracy exceeding standard limits.",
    color: "from-fuchsia-500/20 to-purple-600/10",
    iconColor: "text-fuchsia-400",
    border: "border-fuchsia-500/30"
  },
  {
    icon: Zap,
    title: "Light-speed Execution",
    description: "The execution engine places and closes orders in under 50ms using dedicated async WebSocket tunnels directly to exchange core servers.",
    color: "from-amber-500/20 to-yellow-600/10",
    iconColor: "text-amber-400",
    border: "border-amber-500/30"
  },
  {
    icon: Globe,
    title: "Omni-Exchange Routing",
    description: "Trade seamlessly across Binance, Bybit, KuCoin, OKX, and more. Synchronize multiple portfolios across dimensions in a single unified interface.",
    color: "from-emerald-500/20 to-green-600/10",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/30"
  },
  {
    icon: ShieldCheck,
    title: "Aegis Risk Protocol",
    description: "Dynamic per-trade stop loss, dynamic take profit, daily drawdown limits, and max position size controls to protect your capital autonomously.",
    color: "from-rose-500/20 to-red-600/10",
    iconColor: "text-rose-400",
    border: "border-rose-500/30"
  },
  {
    icon: TrendingUp,
    title: "Hyper-Futures Modality",
    description: "Run strategies on spot markets or leverage perpetual swaps with integrated liquidation evasion and unified risk controls.",
    color: "from-indigo-500/20 to-blue-600/10",
    iconColor: "text-indigo-400",
    border: "border-indigo-500/30"
  },
]

const STATS = [
  { value: "< 20ms",   label: "Quantum Execution Speed"   },
  { value: "99.9%",    label: "Uptime Reliability"    },
  { value: "Multi",    label: "Exchange Dimensionality"     },
  { value: "AI+",      label: "Algorithmic Precision"         },
]



export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col font-sans selection:bg-neutral-500/30 relative overflow-hidden">

      {/* ── Cosmic Background Effects ──────────────────────── */}
      <CosmicBackground />

      {/* ── Navbar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-[spin_3s_linear_infinite]" />
              <Activity className="h-4 w-4 text-white relative z-10" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              OrderBookExpert
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors drop-shadow-md">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors drop-shadow-md">Core Engine</a>
            <a href="#stats" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors drop-shadow-md">Metrics</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2 text-sm font-semibold text-white overflow-hidden transition-all hover:bg-white/10 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-neutral-500/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">Start Now <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center pt-32 pb-20 px-6 min-h-[90vh]">
        {/* Animated Badge */}
        <div className="group mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm cursor-default hover:bg-cyan-500/20 transition-colors">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-semibold text-cyan-300 uppercase tracking-widest">
            Machine Learning Engine Online
          </span>
        </div>

        {/* Headline */}
        <h1 className="w-full max-w-[95vw] text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[1.1] mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.07)] mx-auto">
          <span className="whitespace-nowrap relative inline-block">
            <span className="absolute -inset-2 bg-neutral-100 blur-2xl opacity-[7%] animate-[pulse_3s_ease-in-out_infinite]" />
            <span className="relative bg-gradient-to-b from-white/90 via-neutral-300/80 to-neutral-500/80 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              MACHINE LEARNING BOT
            </span>
          </span>
          <span className="text-2xl md:text-4xl lg:text-5xl font-mono font-light tracking-widest text-neutral-400/80 uppercase mt-4 block">
            With <span className="text-white/90 font-bold tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">AI Precision</span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed font-light mb-10">
          Harness the power of XGBoost & LSTM neural networks. Detect unseen market anomalies, anticipate liquidity shifts, and execute trades at the speed of light.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-8 py-4 text-base font-bold text-slate-950 overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500" />
            Launch Terminal <Zap className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white hover:bg-white/10 transition-colors backdrop-blur-md"
          >
            Explore Architecture
          </a>
        </div>

        {/* Decorative interface elements */}
        <div className="absolute bottom-10 left-10 hidden lg:flex flex-col gap-2 text-xs font-mono text-cyan-500/50">
          <span>SYS.OP // NORMAL</span>
          <span>LATENCY // 14MS</span>
          <span>NODES // 1,024 ACTIVE</span>
        </div>
        <div className="absolute bottom-10 right-10 hidden lg:flex flex-col gap-2 text-xs font-mono text-fuchsia-500/50 text-right">
          <span>AI.MDL // HYBRID_LSTM</span>
          <span>EPOCH // 4,892</span>
          <span>LOSS // 0.0014</span>
        </div>
      </section>

      {/* ── Glassmorphism Stats Bar ─────────────────────── */}
      <section id="stats" className="relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
              {STATS.map((s, i) => (
                <div key={s.label} className={`text-center ${i === 0 ? 'border-none' : ''}`}>
                  <p className="text-3xl md:text-4xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent drop-shadow-sm">{s.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-cyan-400/80 font-mono">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Futuristic Features ─────────────────────────── */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-mono tracking-widest text-fuchsia-400 mb-4 uppercase">System Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Advanced Neural Infrastructure
            </h3>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
              Built on cutting-edge machine learning and ultra-low latency web sockets, designed for the modern algorithmic trader.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`group relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04]`}
              >
                {/* Hover gradient background effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-2xl border ${feature.border} bg-[#030014]/50 backdrop-blur-sm mb-6 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-light group-hover:text-slate-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works (Core Engine) ──────────────────── */}
      <section id="how-it-works" className="relative z-10 py-32 px-6 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-mono tracking-widest text-indigo-400 mb-4 uppercase">Execution Pipeline</h2>
            <h3 className="text-4xl font-bold tracking-tight text-white">Three-Phase Neural Workflow</h3>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[20%] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-white/0 via-white/20 to-neutral-500/0" />
            
            {[
              { step: "01", title: "Data Ingestion", desc: "Real-time websocket streams capture millions of L2 order book mutations per hour into high-speed Redis memory.", icon: Globe },
              { step: "02", title: "Model Inference", desc: "Our Hybrid XGBoost+LSTM core analyzes the tensors, predicting momentum shifts with microsecond latency.", icon: Brain },
              { step: "03", title: "Trade Execution", desc: "Autonomous agents dynamically adjust positions, placing iceberg orders and trailing stops to maximize alpha.", icon: Sparkles },
            ].map((item, index) => (
              <div key={item.step} className="relative z-10 flex flex-col items-center text-center group">
                <div className="relative mb-8">
                  <div className="h-20 w-20 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center relative z-10 group-hover:border-white/50 transition-colors duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <item.icon className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors duration-500" />
                  </div>
                  {/* Glowing ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-white/20 group-hover:scale-125 transition-all duration-500" />
                </div>
                <div className="text-sm font-mono text-neutral-500 mb-3">{item.step} // PHASE</div>
                <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Holographic CTA Banner ──────────────────────── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto relative group">
          {/* Animated glow behind the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neutral-500/30 via-white/20 to-neutral-600/30 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-xl p-12 md:p-20 text-center overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Inner tech pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Ready to Initiate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">Sequence?</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light mb-10">
              Join the vanguard of algorithmic traders. Deploy your first AI model today and experience order book dynamics like never before.
            </p>
            
            <Link
              href="/register"
              className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-black hover:bg-neutral-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]"
            >
              Access the Terminal <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 bg-transparent backdrop-blur-md py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <Activity className="h-5 w-5 text-neutral-400" />
            <span className="text-sm font-bold tracking-widest text-white uppercase">OrderBookExpert</span>
          </div>
          <p className="text-sm text-slate-500 font-light text-center md:text-left">
            © 2026 OrderBookExpert System. Next.js Core & Python AI Matrix.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Terminals</a>
            <a href="#" className="hover:text-white transition-colors">API Docs</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

