import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  MapPin, 
  Zap, 
  Database, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart3,
  RefreshCcw,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-[#0a0c10] text-gray-200 overflow-x-hidden selection:bg-indigo-500/30 font-inter">
      
      {/* --- PREMIUM NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-full z-[100] p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4 rounded-3xl bg-black/20 backdrop-blur-2xl border border-white/5 shadow-2xl">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollTo('home')}>
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">LedgerSpy</span>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {['Features', 'Workflow', 'Comparison'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* ... animated gradients ... */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 50, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" 
          />
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/20 mb-8 backdrop-blur-xl"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Enterprise-Grade Fraud Intelligence</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-8"
          >
            AI-Powered <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic">Financial Integrity</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="max-w-2xl text-lg md:text-xl text-gray-400 leading-relaxed mb-12"
          >
            Detect anomalies, uncover hidden risks, and audit transactions instantly with explainable AI. 
            Designed for high-performance forensic auditing in air-gapped environments.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-lg font-bold text-white transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center">
                Start Analysis <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-lg font-bold text-gray-300 transition-all backdrop-blur-xl">
              View Case Study
            </button>
          </motion.div>

          {/* Stats Badges */}
          <motion.div 
            variants={itemVariants}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-60"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-white">19,000+</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Records Analyzed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">99.8%</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Pattern Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">0s</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Latency Delay</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Phi-3</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Neural Core</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 opacity-30 cursor-pointer"
          onClick={() => scrollTo('workflow')}
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
          <span className="text-[10px] uppercase tracking-widest font-black">Scroll</span>
        </motion.div>
      </section>

      {/* --- PROBLEM + SOLUTION --- */}
      <section className="py-32 px-4 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manual audits are <span className="text-red-500/80 italic">slow</span>, error-prone, and miss hidden fraud.
            </h2>
            <div className="space-y-4">
              {[
                "Scanning thousands of rows manually takes weeks",
                "Complex money-laundering patterns stay hidden",
                "No explainability behind flagged transactions"
              ].map((p, i) => (
                <div key={i} className="flex items-center space-x-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                  <p className="text-lg">{p}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-white/5 space-y-8 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            <h2 className="text-4xl font-bold text-white leading-tight">
              LedgerSpy solves this with <span className="text-indigo-400">AI-powered</span> forensics.
            </h2>
            <div className="space-y-4">
              {[
                "Detect structural anomalies in milliseconds",
                "Highlight exact row-level causes instantly",
                "Explain WHY a transaction was flagged as risky"
              ].map((s, i) => (
                <div key={i} className="flex items-center space-x-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <p className="text-lg">{s}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="workflow" className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Three Steps to Integrity</h2>
          <p className="text-gray-400">Our seamless automated ingestion pipeline turns raw data into actionable evidence.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-y-12" />
          
          {[
            { 
              step: "01", 
              title: "Source Ingestion", 
              desc: "Upload raw Ledger or Bank CSV/Excel files. Our system handles messy formatting and auto-heals null values.",
              icon: Database
            },
            { 
              step: "02", 
              title: "Neural Scan", 
              desc: "AI-service + ML pattern scan analyzes every transaction against Benford benchmarks and risk rules.",
              icon: Cpu
            },
            { 
              step: "03", 
              title: "Legal-Ready Output", 
              desc: "Generate professional audit memos and visual relational maps to defend findings in any environment.",
              icon: MapPin
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 backdrop-blur-sm group hover:border-indigo-500/30 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:bg-indigo-600/20 transition-all">
                <item.icon className="w-8 h-8 text-indigo-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/50 mb-4 block">Step {item.step}</span>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 px-4 bg-indigo-600/[0.02]">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Core Forensic Capabilities</h2>
          <p className="text-gray-400">Advanced analysis engines designed for the modern financial auditor.</p>
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {[
            { title: "Anomaly Detection", icon: ShieldAlert, desc: "Uses Isolation Forest algorithms to find the 'mathematical outsiders' in your data." },
            { title: "Rule-Based Risk", icon: Zap, desc: "Combines classic audit rules (unusual timing, high amounts) with fuzzy logic scanning." },
            { title: "Row-Level Tracking", icon: Layers, desc: "See exactly which row in the source file caused the alert. No more hunting through spreadsheets." },
            { title: "Bank Reconciliation", icon: RefreshCcw, desc: "Automated vouching that matches ledger entries against scanned bank statements instantly." },
            { title: "Vendor Risk Analysis", icon: TrendingUp, desc: "Detects vendor shell company patterns and unusual payment accelerations automatically." },
            { title: "Explainable Insights", icon: Search, desc: "No black boxes. Get a percentage breakdown of why every flagged item is considered high risk." }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
              <f.icon className="w-6 h-6 text-indigo-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- COMPARISON TABLE --- */}
      <section id="comparison" className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight">The LedgerSpy Edge</h2>
          <p className="text-gray-400">Comparing traditional manual auditing with our AI-driven forensics.</p>
        </div>
        <div className="max-w-5xl mx-auto overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-8 text-sm font-bold text-gray-500 uppercase tracking-widest">Capabilities</th>
                <th className="p-8 text-sm font-bold text-gray-500 uppercase tracking-widest">Traditional Audit</th>
                <th className="p-8 text-sm font-bold text-indigo-400 uppercase tracking-widest bg-indigo-600/5">LedgerSpy Suite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["Processing Speed", "Manual (Days)", "Instant (Seconds)"],
                ["Error Tolerance", "High (Manual Entry)", "Zero (Auto-Healing)"],
                ["Patterns Detected", "Static (Thresholds)", "Full Neural Scan"],
                ["Explainability", "Narrative Only", "Data-Backed Analytics"],
                ["Scalability", "Limited by Man-Hours", "Infinite Through AI"]
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-8 text-xs font-bold text-gray-400 capitalize">{row[0]}</td>
                  <td className="p-8 text-sm text-gray-500">{row[1]}</td>
                  <td className="p-8 text-sm text-indigo-300 font-bold bg-indigo-600/[0.02]">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- CLOSING CTA --- */}
      <section className="py-48 px-4 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[180px] -z-10" />
        
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           viewport={{ once: true }}
           className="space-y-10"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            Ready to secure the <br /> 
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">financial integrity?</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
            Join forensic auditors who have already analyzed over 19k records locally, securely, and instantly.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-12 py-5 bg-white text-[#0a0c10] rounded-2xl text-lg font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
          >
            Launch Intelligence Dashboard <ArrowRight className="ml-3 w-6 h-6" />
          </button>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-4 border-t border-white/5 opacity-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-black uppercase tracking-widest text-white">LedgerSpy Forensic Suite v1.0</span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest">Air-Gapped | ML Ready | Law-Grade Forensics</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;