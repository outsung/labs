"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT_QUINT },
  },
};

function CharacterReveal({ text, className }: { text: string; className?: string }) {
  const chars = text.split("");
  return (
    <span className={className}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{
            delay: 0.6 + i * 0.03,
            duration: 0.6,
            ease: EASE_OUT_QUINT,
          }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * WindowShadowOverlay — the signature Daylight effect.
 *
 * Implements the actual technique from the Basement Studio blog:
 * https://basement.studio/post/creating-daylight-or-the-shadows
 *
 * 1. Creates a depth map texture with blind slat objects
 *    (Red channel = depth, Green channel = 1.0 means object exists)
 * 2. Applies a GLSL fragment shader with Vogel Disk Sampling (100 samples/pixel)
 *    to compute physically-realistic soft shadows
 * 3. Shadow softness depends on object depth — closer = sharper, farther = softer
 * 4. Renders at 1/3 resolution for performance, composited via mix-blend-mode: multiply
 */
function WindowShadowOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      alpha: false,
    });
    if (!gl) return;

    const RENDER_SCALE = 0.33;

    // ─── GLSL Shaders (from Basement Studio blog) ───

    const vertexSource = `
      attribute vec2 aPosition;
      varying vec2 vTexCoord;
      void main() {
        vTexCoord = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Vogel Disk Sampling shadow shader — adapted from the blog post
    const fragmentSource = `
      precision highp float;
      uniform sampler2D uDepthMap;
      uniform float uWidth;
      uniform float uHeight;
      varying vec2 vTexCoord;

      const float pi = 3.14159265358979;
      const float goldenAngle = pi * (3.0 - sqrt(5.0));
      const float diskSize = 80.0;
      const int diskSamples = 100;
      const float minSize = 20.0;
      const float maxSize = 300.0;

      vec3 rand(vec2 uv) {
        return vec3(
          fract(sin(dot(uv, vec2(12.75613, 38.12123))) * 13234.76575),
          fract(sin(dot(uv, vec2(19.45531, 58.46547))) * 43678.23431),
          fract(sin(dot(uv, vec2(23.67817, 78.23121))) * 93567.23423)
        );
      }

      void main() {
        vec2 uv = vTexCoord;
        uv.y = 1.0 - uv.y;

        float shadowInfluence = 0.0;
        float noiseSample = rand(uv).x;
        float angle = noiseSample * pi;
        float cosA = cos(angle);
        float sinA = sin(angle);

        for (int i = 1; i <= diskSamples; i++) {
          float r = diskSize * sqrt(float(i) / float(diskSamples));
          float theta = float(i) * goldenAngle;

          vec2 offset = vec2(r * cos(theta), r * sin(theta));
          vec2 rotated = vec2(
            cosA * offset.x - sinA * offset.y,
            sinA * offset.x + cosA * offset.y
          );

          vec4 samp = texture2D(uDepthMap, uv + rotated / vec2(uWidth, uHeight));

          if (samp.r > 0.0 && samp.g > 0.9) {
            float dist = length(offset);
            float size = (samp.r * (maxSize - minSize)) + minSize;

            if (size / 2.0 >= dist) {
              shadowInfluence += mix(8.0, 0.5, size / maxSize);
            }
          }
        }

        float shadowFactor = shadowInfluence / float(diskSamples);
        shadowFactor = clamp(shadowFactor, 0.0, 0.8);

        // Warm-tinted shadow (not cold gray)
        vec3 color = mix(vec3(1.0), vec3(0.92, 0.90, 0.88), shadowFactor);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // ─── Compile & link shaders ───

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl!.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    // ─── Full-screen quad geometry ───

    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "aPosition");
    const uDepthMap = gl.getUniformLocation(program, "uDepthMap");
    const uWidth = gl.getUniformLocation(program, "uWidth");
    const uHeight = gl.getUniformLocation(program, "uHeight");

    // ─── Depth map generation ───
    // Draws blind slat objects into a 2D canvas.
    // Red channel = depth (0-1), Green = 255 means "object here".

    function generateDepthMap(w: number, h: number): HTMLCanvasElement {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;

      // Black background = empty space (no objects)
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, w, h);

      // Time-based shadow angle
      const now = new Date();
      const hours = now.getHours() + now.getMinutes() / 60;
      const t = Math.max(0, Math.min(1, (hours - 6) / 12));
      const arc = -4 * (t - 0.5) ** 2 + 1;
      const angleDeg = -45 + arc * 25;
      const angleRad = (angleDeg * Math.PI) / 180;

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(angleRad);

      // ─ Blind slats ─
      // Each slat gets a slightly different depth for natural variation
      const slatSpacing = 50;
      const slatWidth = 5;
      const count = Math.ceil((Math.max(w, h) * 2) / slatSpacing);

      for (let i = -count; i <= count; i++) {
        // Deterministic depth variation per slat (0.25 – 0.45 range)
        const depth = 0.3 + Math.sin(i * 1.37) * 0.08 + Math.cos(i * 0.73) * 0.05;
        const r = Math.round(Math.max(1, Math.min(255, depth * 255)));
        ctx.fillStyle = `rgb(${r}, 255, 0)`;
        ctx.fillRect(-w * 2, i * slatSpacing, w * 4, slatWidth);
      }

      // ─ Window frame crossbars ─
      // At greater depth → softer, wider shadows
      const frameDepth = Math.round(0.65 * 255);
      ctx.fillStyle = `rgb(${frameDepth}, 255, 0)`;
      ctx.fillRect(-w * 2, -h * 0.15, w * 4, 10); // horizontal bar
      ctx.fillRect(-w * 2, h * 0.35, w * 4, 10); // second horizontal bar

      ctx.restore();

      // Vertical frame bar (perpendicular to slats)
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(angleRad + Math.PI / 2);
      ctx.fillStyle = `rgb(${frameDepth}, 255, 0)`;
      ctx.fillRect(-w * 2, 0, w * 4, 10);
      ctx.restore();

      return c;
    }

    // ─── WebGL texture upload ───

    let depthTex: WebGLTexture | null = null;

    function uploadTex(source: HTMLCanvasElement) {
      if (depthTex) gl!.deleteTexture(depthTex);
      depthTex = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, depthTex);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    }

    // ─── Render ───

    function render() {
      if (!canvas || !gl) return;
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(window.innerWidth * RENDER_SCALE * dpr);
      const h = Math.round(window.innerHeight * RENDER_SCALE * dpr);

      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);

      // Generate and upload depth map
      const depthCanvas = generateDepthMap(w, h);
      uploadTex(depthCanvas);

      // Run shadow shader
      gl!.useProgram(program);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, depthTex);
      gl!.uniform1i(uDepthMap, 0);
      gl!.uniform1f(uWidth, w);
      gl!.uniform1f(uHeight, h);

      gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuf);
      gl!.enableVertexAttribArray(aPos);
      gl!.vertexAttribPointer(aPos, 2, gl!.FLOAT, false, 0, 0);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    render();

    const onResize = () => render();
    window.addEventListener("resize", onResize);
    // Re-render every minute for time-based shadow shift
    const interval = setInterval(render, 60000);

    return () => {
      window.removeEventListener("resize", onResize);
      clearInterval(interval);
      if (depthTex) gl!.deleteTexture(depthTex);
      gl!.deleteProgram(program);
      gl!.deleteShader(vs);
      gl!.deleteShader(fs);
      gl!.deleteBuffer(quadBuf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}

function DaylightNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { href: "#story", label: "Story" },
    { href: "#specs", label: "Specs" },
    { href: "#reviews", label: "Reviews" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT_QUINT }}
      className="fixed top-0 z-50 w-full bg-[#faf5f2]/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-[6vw]">
        <span className="font-[Georgia,_'Times_New_Roman',serif] text-lg text-[#1a1815]">
          daylight
        </span>
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-[#8a8078] transition-colors hover:text-[#1a1815]">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1a1815]/15 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <div className="flex w-4 flex-col gap-1">
              <span className={`block h-px bg-[#1a1815] transition-transform ${mobileOpen ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`block h-px bg-[#1a1815] transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px bg-[#1a1815] transition-transform ${mobileOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </div>
          </button>
          <button className="rounded-full border border-[#1a1815] px-5 py-2 text-xs font-medium tracking-wide text-[#1a1815] transition-colors hover:bg-[#1a1815] hover:text-[#faf5f2]">
            Order Now
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
            className="overflow-hidden border-t border-[#1a1815]/5 lg:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[#8a8078] transition-colors hover:text-[#1a1815]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 lg:px-[6vw]">
      <div className="mx-auto max-w-7xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE_OUT_QUINT }}
          className="mb-6 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs"
        >
          Introducing Daylight DC-1
        </motion.p>

        <h1 className="overflow-hidden font-[Georgia,_'Times_New_Roman',serif] text-[clamp(3rem,8vw,7.5rem)] font-normal leading-[1.05] text-[#1a1815]">
          <CharacterReveal text="The computer," />
          <br />
          <CharacterReveal text="re-imagined" />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6, ease: EASE_OUT_QUINT }}
          className="mx-auto mt-8 max-w-lg text-base text-[#2a2520] lg:text-lg"
        >
          A tablet designed for reading, writing, and focused work. Built for
          the way your eyes and mind actually work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6, ease: EASE_OUT_QUINT }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <button className="rounded-full bg-[#1a1815] px-8 py-3.5 text-sm font-medium text-[#faf5f2] transition-opacity hover:opacity-90">
            Pre-order DC-1
          </button>
          <button className="rounded-full border border-[#1a1815]/20 px-8 py-3.5 text-sm font-medium text-[#1a1815] transition-colors hover:border-[#1a1815]/40">
            Learn more
          </button>
        </motion.div>

        {/* Product Visual */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.8, duration: 1, ease: EASE_OUT_QUINT }}
          className="mx-auto mt-16 max-w-2xl lg:mt-24"
        >
          <div className="relative rounded-[20px] bg-[#f0e8e0] p-4 shadow-[0_2px_4px_rgba(26,24,21,0.10),0_8px_24px_rgba(26,24,21,0.08),0_24px_60px_rgba(26,24,21,0.06)] lg:rounded-[32px] lg:p-6">
            {/* Light overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,248,240,0.4)_0%,transparent_60%)] lg:rounded-[32px]" />
            {/* Screen */}
            <div className="relative overflow-hidden rounded-xl bg-white p-6 lg:rounded-2xl lg:p-10">
              {/* Sidebar dots */}
              <div className="absolute left-4 top-6 flex flex-col gap-2 lg:left-6">
                <div className="h-2.5 w-2.5 rounded-full bg-[#c4a46a]/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#585b3d]/40" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#8a8078]/30" />
              </div>
              {/* Simulated text lines */}
              <div className="ml-8 space-y-4 py-4 lg:ml-10 lg:py-8">
                <div className="h-3 w-3/4 rounded bg-[#1a1815]/10" />
                <div className="h-3 w-full rounded bg-[#1a1815]/8" />
                <div className="h-3 w-5/6 rounded bg-[#1a1815]/8" />
                <div className="mt-6 h-2.5 w-2/3 rounded bg-[#1a1815]/6" />
                <div className="h-2.5 w-full rounded bg-[#1a1815]/6" />
                <div className="h-2.5 w-4/5 rounded bg-[#1a1815]/6" />
                <div className="h-2.5 w-3/4 rounded bg-[#1a1815]/6" />
                <div className="mt-6 h-2.5 w-1/2 rounded bg-[#1a1815]/6" />
                <div className="h-2.5 w-full rounded bg-[#1a1815]/6" />
                <div className="h-2.5 w-5/6 rounded bg-[#1a1815]/6" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <motion.section
      variants={sectionAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      id="story"
      className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-8 h-px w-16 bg-[#c4a46a]/40" />
        <blockquote className="font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,2rem)] leading-relaxed text-[#1a1815]">
          &ldquo;We believe your most important technology should not leave you
          feeling exhausted, distracted, or in pain.&rdquo;
        </blockquote>
        <div className="mx-auto mt-8 h-px w-16 bg-[#c4a46a]/40" />
      </div>
    </motion.section>
  );
}

function BenefitsGrid() {
  const benefits = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="4" y="8" width="24" height="16" rx="2" stroke="#c4a46a" strokeWidth="1.5" />
          <line x1="4" y1="14" x2="28" y2="14" stroke="#c4a46a" strokeWidth="1" opacity="0.5" />
          <line x1="4" y1="18" x2="28" y2="18" stroke="#c4a46a" strokeWidth="1" opacity="0.3" />
        </svg>
      ),
      title: "Smooth like paper",
      description:
        "A reflective display that mimics the texture and feel of real paper. No more glossy glare or eye strain from backlit screens.",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="10" stroke="#c4a46a" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="4" fill="#c4a46a" opacity="0.3" />
        </svg>
      ),
      title: "Calm by design",
      description:
        "No notifications pulling you away. No infinite feeds. Just you and your content, in a distraction-free environment.",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 6 L16 16 L22 22" stroke="#c4a46a" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="16" r="11" stroke="#c4a46a" strokeWidth="1.5" />
        </svg>
      ),
      title: "Built for health",
      description:
        "Warm-toned ambient light follows your circadian rhythm. Blue-light-free technology that lets you read comfortably day and night.",
    },
  ];

  return (
    <section className="bg-[#f5ede8] px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
      <div className="mx-auto max-w-7xl">
        <motion.p
          variants={sectionAnim}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-4 text-center font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs"
        >
          Why Daylight
        </motion.p>
        <motion.h2
          variants={sectionAnim}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#1a1815]"
        >
          A different kind of screen
        </motion.h2>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              variants={sectionAnim}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white p-8 shadow-[0_1px_2px_rgba(26,24,21,0.08),0_4px_12px_rgba(26,24,21,0.06),0_16px_40px_rgba(26,24,21,0.04)] lg:p-10"
            >
              <div className="mb-6">{b.icon}</div>
              <h3 className="mb-3 font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,1.5rem)] text-[#1a1815]">
                {b.title}
              </h3>
              <p className="leading-relaxed text-[#2a2520]/70">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureShowcase() {
  const features = [
    {
      label: "Reading",
      title: "Read without limits",
      description:
        "Our LivePaper display renders text with the clarity of printed paper. Read for hours without fatigue, in any lighting condition — even direct sunlight.",
      visual: (
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(26,24,21,0.08),0_4px_12px_rgba(26,24,21,0.06),0_16px_40px_rgba(26,24,21,0.04)] lg:p-8">
          {/* Simulated article */}
          <div className="mb-4 h-3 w-1/3 rounded bg-[#c4a46a]/30" />
          <div className="mb-6 h-5 w-3/4 rounded bg-[#1a1815]/12" />
          <div className="space-y-3">
            <div className="h-2.5 w-full rounded bg-[#1a1815]/8" />
            <div className="h-2.5 w-5/6 rounded bg-[#1a1815]/8" />
            <div className="h-2.5 w-full rounded bg-[#1a1815]/8" />
            <div className="h-2.5 w-4/5 rounded bg-[#1a1815]/8" />
            <div className="mt-4 h-2.5 w-full rounded bg-[#1a1815]/6" />
            <div className="h-2.5 w-3/4 rounded bg-[#1a1815]/6" />
            <div className="h-2.5 w-5/6 rounded bg-[#1a1815]/6" />
          </div>
        </div>
      ),
    },
    {
      label: "Writing",
      title: "Write with focus",
      description:
        "A minimal writing surface that feels like a notebook. Low-latency stylus input and a calm interface let your thoughts flow without friction.",
      visual: (
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(26,24,21,0.08),0_4px_12px_rgba(26,24,21,0.06),0_16px_40px_rgba(26,24,21,0.04)] lg:p-8">
          {/* Simulated writing canvas */}
          <div className="border-b border-[#1a1815]/5 pb-3">
            <div className="h-4 w-2/5 rounded bg-[#1a1815]/10" />
          </div>
          <div className="mt-6 space-y-6">
            <div className="flex items-end">
              <div className="h-2.5 w-3/4 rounded bg-[#1a1815]/8" />
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, repeatType: "reverse" }}
                className="ml-0.5 h-4 w-0.5 bg-[#c4a46a]"
              />
            </div>
            <div className="h-px w-full bg-[#1a1815]/5" />
            <div className="h-px w-full bg-[#1a1815]/5" />
            <div className="h-px w-full bg-[#1a1815]/5" />
            <div className="h-px w-full bg-[#1a1815]/5" />
          </div>
        </div>
      ),
    },
    {
      label: "Organization",
      title: "Organize naturally",
      description:
        "Arrange your notes, documents, and reading list like cards on a desk. Spatial organization that mirrors how you actually think.",
      visual: (
        <div className="grid grid-cols-2 gap-3">
          {[
            { w: "w-3/4", h: "h-20", color: "bg-[#585b3d]/10" },
            { w: "w-full", h: "h-24", color: "bg-[#c4a46a]/10" },
            { w: "w-full", h: "h-28", color: "bg-[#272819]/8" },
            { w: "w-2/3", h: "h-20", color: "bg-[#434626]/10" },
          ].map((card, i) => (
            <div
              key={i}
              className={`${card.h} rounded-xl ${card.color} p-4 shadow-[0_1px_3px_rgba(26,24,21,0.04),0_4px_8px_rgba(26,24,21,0.03)]`}
            >
              <div className={`${card.w} mb-2 h-2 rounded bg-[#1a1815]/10`} />
              <div className="h-1.5 w-full rounded bg-[#1a1815]/5" />
              <div className="mt-1 h-1.5 w-4/5 rounded bg-[#1a1815]/5" />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
      <div className="mx-auto max-w-7xl space-y-24 lg:space-y-32">
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
              i % 2 === 1 ? "lg:[direction:rtl]" : ""
            }`}
          >
            <div className={i % 2 === 1 ? "lg:[direction:ltr]" : ""}>
              <p className="mb-3 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs">
                {f.label}
              </p>
              <h3 className="mb-4 font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,2rem)] text-[#1a1815]">
                {f.title}
              </h3>
              <p className="max-w-md leading-relaxed text-[#2a2520]/70">{f.description}</p>
            </div>
            <div className={i % 2 === 1 ? "lg:[direction:ltr]" : ""}>{f.visual}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SpecsSection() {
  const specs = [
    {
      value: '10.5"',
      label: "Display",
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="4" y="6" width="20" height="16" rx="2" stroke="#c4a46a" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      value: "60Hz",
      label: "Refresh Rate",
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <polyline points="4,20 10,12 16,16 24,8" stroke="#c4a46a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      value: "12hr",
      label: "Battery Life",
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="3" y="10" width="20" height="10" rx="2" stroke="#c4a46a" strokeWidth="1.5" />
          <rect x="25" y="13" width="2" height="4" rx="0.5" fill="#c4a46a" opacity="0.6" />
          <rect x="6" y="13" width="8" height="4" rx="1" fill="#c4a46a" opacity="0.3" />
        </svg>
      ),
    },
    {
      value: "450g",
      label: "Weight",
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="18" r="6" stroke="#c4a46a" strokeWidth="1.5" />
          <path d="M11 12 L14 8 L17 12" stroke="#c4a46a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      value: "LivePaper",
      label: "Technology",
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="5" stroke="#c4a46a" strokeWidth="1.5" />
          <line x1="14" y1="4" x2="14" y2="7" stroke="#c4a46a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="21" x2="14" y2="24" stroke="#c4a46a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="14" x2="7" y2="14" stroke="#c4a46a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="21" y1="14" x2="24" y2="14" stroke="#c4a46a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section id="specs" className="bg-[#1a1815] px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
      <div className="mx-auto max-w-7xl">
        <motion.p
          variants={sectionAnim}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-4 text-center font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs"
        >
          Specifications
        </motion.p>
        <motion.h2
          variants={sectionAnim}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#faf5f2]"
        >
          What&apos;s inside
        </motion.h2>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-5 lg:gap-4">
          {specs.map((s, i) => (
            <motion.div
              key={i}
              variants={sectionAnim}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center rounded-2xl border border-[#d4b87a22] p-6 text-center lg:p-8"
            >
              <div className="mb-4">{s.icon}</div>
              <p className="font-[Georgia,_'Times_New_Roman',serif] text-2xl text-[#faf5f2] lg:text-3xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-[#8a8078]">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OutdoorSection() {
  return (
    <section className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
      <motion.div
        variants={sectionAnim}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16"
      >
        <div>
          <p className="mb-3 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs">
            Sunlight readable
          </p>
          <h2 className="mb-6 font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#1a1815]">
            Take it outside
          </h2>
          <p className="max-w-md leading-relaxed text-[#2a2520]/70">
            Unlike traditional screens that wash out in bright light, the DC-1
            uses ambient light to illuminate the display — just like real paper.
            The brighter the sun, the better it looks.
          </p>
        </div>
        {/* Sun scene illustration */}
        <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#f5ede8] to-[#faf5f2] lg:h-96">
          {/* Sun */}
          <div className="absolute right-12 top-12 lg:right-16 lg:top-16">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-[#c4a46a]/20" />
              <div className="absolute inset-2 rounded-full bg-[#c4a46a]/30" />
              <div className="absolute inset-4 rounded-full bg-[#c4a46a]/50" />
              {/* Rays */}
              <div className="absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-[#c4a46a]/30" />
              <div className="absolute -bottom-4 left-1/2 h-4 w-px -translate-x-1/2 bg-[#c4a46a]/30" />
              <div className="absolute -left-4 top-1/2 h-px w-4 -translate-y-1/2 bg-[#c4a46a]/30" />
              <div className="absolute -right-4 top-1/2 h-px w-4 -translate-y-1/2 bg-[#c4a46a]/30" />
            </div>
          </div>
          {/* Small device */}
          <div className="relative mt-8">
            <div className="h-32 w-24 rounded-lg bg-[#f0e8e0] p-2 shadow-[0_1px_2px_rgba(26,24,21,0.08),0_4px_12px_rgba(26,24,21,0.06),0_16px_40px_rgba(26,24,21,0.04)] lg:h-40 lg:w-28">
              <div className="h-full rounded bg-white p-2">
                <div className="space-y-1.5">
                  <div className="h-1.5 w-3/4 rounded bg-[#1a1815]/10" />
                  <div className="h-1.5 w-full rounded bg-[#1a1815]/6" />
                  <div className="h-1.5 w-5/6 rounded bg-[#1a1815]/6" />
                  <div className="h-1.5 w-2/3 rounded bg-[#1a1815]/6" />
                </div>
              </div>
            </div>
          </div>
          {/* Light rays from sun */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(196,164,106,0.12)_0%,transparent_50%)]" />
        </div>
      </motion.div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "I have not used my iPad since getting the DC-1. Reading on this device is genuinely transformative.",
      name: "Sarah Chen",
      role: "Writer & Editor",
    },
    {
      quote:
        "As someone who stares at screens 12 hours a day, the Daylight has been a revelation. My eye strain headaches are gone.",
      name: "Marcus Rivera",
      role: "Software Engineer",
    },
    {
      quote: "The paper-like display is not a gimmick. It actually feels different. My focus has noticeably improved.",
      name: "Emily Watanabe",
      role: "PhD Researcher",
    },
    {
      quote:
        "I bought it for reading but now I do all my writing on it. The stylus latency is incredible.",
      name: "David Park",
      role: "Journalist",
    },
    {
      quote:
        "Finally, a device that does not fight for my attention. No notifications, no distractions. Just work.",
      name: "Leila Osman",
      role: "Product Designer",
    },
  ];

  return (
    <section id="reviews" className="bg-[#f5ede8] px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
      <div className="mx-auto max-w-7xl">
        <motion.p
          variants={sectionAnim}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-4 text-center font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs"
        >
          Reviews
        </motion.p>
        <motion.h2
          variants={sectionAnim}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#1a1815]"
        >
          Loved by readers
        </motion.h2>
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={sectionAnim}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="mb-6 break-inside-avoid rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(26,24,21,0.08),0_4px_12px_rgba(26,24,21,0.06),0_16px_40px_rgba(26,24,21,0.04)] lg:p-8"
            >
              <span className="font-[Georgia,_'Times_New_Roman',serif] text-3xl leading-none text-[#c4a46a]">
                &ldquo;
              </span>
              <p className="mt-2 leading-relaxed text-[#2a2520]/80">{t.quote}</p>
              <div className="mt-6 border-t border-[#1a1815]/5 pt-4">
                <p className="text-sm font-medium text-[#1a1815]">{t.name}</p>
                <p className="text-xs text-[#8a8078]">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PressSection() {
  const press = ["The Verge", "Wired", "Fast Company", "TechCrunch", "Ars Technica"];

  return (
    <motion.section
      variants={sectionAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]"
    >
      <div className="mx-auto max-w-7xl">
        <p className="mb-10 text-center font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs">
          Featured in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {press.map((name, i) => (
            <span
              key={i}
              className="font-[Georgia,_'Times_New_Roman',serif] text-xl text-[#1a1815]/20 lg:text-2xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function PublicBenefitSection() {
  return (
    <motion.section
      variants={sectionAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]"
    >
      <div className="mx-auto max-w-3xl text-center">
        {/* Sun illustration */}
        <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border border-[#c4a46a]/20" />
            <div className="absolute inset-2 rounded-full border border-[#c4a46a]/30" />
            <div className="absolute inset-4 rounded-full bg-[#c4a46a]/15" />
            {/* 4 rays */}
            <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-[#c4a46a]/40" />
            <div className="absolute -bottom-3 left-1/2 h-3 w-px -translate-x-1/2 bg-[#c4a46a]/40" />
            <div className="absolute -left-3 top-1/2 h-px w-3 -translate-y-1/2 bg-[#c4a46a]/40" />
            <div className="absolute -right-3 top-1/2 h-px w-3 -translate-y-1/2 bg-[#c4a46a]/40" />
          </div>
        </div>
        <h2 className="mb-6 font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#1a1815]">
          Technology should serve humanity
        </h2>
        <p className="mx-auto max-w-xl leading-relaxed text-[#2a2520]/70">
          Daylight is a Public Benefit Corporation. We are committed to building
          technology that improves human health and well-being, not technology
          that exploits attention for profit.
        </p>
        <div className="mt-8 text-sm text-[#8a8078]">
          <span className="italic">Anjan Katta</span> &mdash; Founder & CEO
        </div>
      </div>
    </motion.section>
  );
}

function DaylightFooter() {
  return (
    <footer className="border-t border-[#1a1815]/10 px-6 py-12 lg:px-[6vw]">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
        <div>
          <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078]">
            Product
          </p>
          <div className="space-y-2">
            <p className="text-sm text-[#2a2520]/60">DC-1 Tablet</p>
            <p className="text-sm text-[#2a2520]/60">Accessories</p>
            <p className="text-sm text-[#2a2520]/60">Sol:Reader</p>
          </div>
        </div>
        <div>
          <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078]">
            Company
          </p>
          <div className="space-y-2">
            <p className="text-sm text-[#2a2520]/60">About</p>
            <p className="text-sm text-[#2a2520]/60">Blog</p>
            <p className="text-sm text-[#2a2520]/60">Careers</p>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078]">
              Connect
            </p>
            <div className="space-y-2">
              <p className="text-sm text-[#2a2520]/60">Twitter</p>
              <p className="text-sm text-[#2a2520]/60">Newsletter</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl items-center justify-between border-t border-[#1a1815]/5 pt-8">
        <div className="flex items-center gap-4">
          <p className="text-xs text-[#8a8078]">
            &copy; 2026 Daylight Computer Co. &mdash; Public Benefit Corporation
          </p>
          <Link
            href="/labs/daylight/playground"
            className="rounded-full border border-[#c4a46a]/30 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[#c4a46a] transition-colors hover:bg-[#c4a46a]/10"
          >
            playground
          </Link>
        </div>
        <Link
          href="/"
          className="text-xs text-[#8a8078] transition-colors hover:text-[#1a1815]"
        >
          &larr; back to labs
        </Link>
      </div>
    </footer>
  );
}

export default function DaylightPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-[#faf5f2] font-sans text-[#1a1815] [&_::selection]:bg-[#c4a46a]/20">
      {/* Override dark body background to prevent bleed-through on overscroll */}
      <style>{`html, body { background-color: #faf5f2 !important; }`}</style>
      <WindowShadowOverlay />
      <DaylightNav />
      <HeroSection />
      <MissionSection />
      <BenefitsGrid />
      <FeatureShowcase />
      <SpecsSection />
      <OutdoorSection />
      <TestimonialsSection />
      <PressSection />
      <PublicBenefitSection />
      <DaylightFooter />
    </div>
  );
}
