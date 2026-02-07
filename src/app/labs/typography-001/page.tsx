"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Typography001() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="fixed top-0 z-50 w-full px-6 py-4">
        <Link
          href="/"
          className="text-xs text-white/30 transition-colors hover:text-white/60"
        >
          &larr; back
        </Link>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8 text-[10px] uppercase tracking-[0.4em] text-white/20"
          >
            Typography Experiment 001
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-light text-[clamp(2.5rem,8vw,7rem)] leading-[0.9] tracking-tighter"
          >
            The quick
            <br />
            <span className="font-extralight italic text-white/40">
              brown fox
            </span>
            <br />
            jumps over
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mx-auto my-10 h-px w-32 bg-white/10"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/15"
          >
            Geist / Light / Tracking Tight
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
