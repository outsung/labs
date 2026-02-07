"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="flex min-h-[70vh] flex-col justify-end px-6 pb-20 pt-32">
      <div className="mx-auto w-full max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-xs uppercase tracking-[0.2em] text-muted"
        >
          Design Experiments
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl"
        >
          Discover, analyze,
          <br />
          recreate, evolve.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 max-w-md text-sm leading-relaxed text-muted"
        >
          A space for independent design experiments — each lab is a focused
          exploration of typography, layout, interaction, and motion.
        </motion.p>
      </div>
    </section>
  );
}
