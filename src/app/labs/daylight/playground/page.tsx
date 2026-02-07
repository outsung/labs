"use client";

import Link from "next/link";
import { useControls, folder, button } from "leva";
import { useMemo, useCallback, useState } from "react";

/* ─── Sample content to see shadows over ─── */
function SampleContent() {
  return (
    <div className="mx-auto max-w-4xl space-y-24 px-6 py-32 lg:px-16">
      {/* Hero */}
      <div className="text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-[#8a8078]">
          Shadow Playground
        </p>
        <h1 className="font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] text-[#1a1815]">
          The computer,
          <br />
          re-imagined
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[#8a8078]">
          Adjust the controls on the right to fine-tune the window shadow effect.
          Changes apply in real-time.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {["Smooth like paper", "Calm by design", "Built for health"].map(
          (title) => (
            <div
              key={title}
              className="rounded-2xl bg-white p-8 shadow-[0_1px_2px_rgba(26,24,21,0.08),0_4px_12px_rgba(26,24,21,0.06),0_16px_40px_rgba(26,24,21,0.04)]"
            >
              <h3 className="mb-3 font-[Georgia,_'Times_New_Roman',serif] text-xl text-[#1a1815]">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-[#2a2520]/70">
                A display that mirrors the warmth and readability of physical
                print, reducing visual fatigue throughout the day.
              </p>
            </div>
          )
        )}
      </div>

      {/* Product mockup */}
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[24px] bg-[#f0e8e0] p-5 shadow-[0_2px_4px_rgba(26,24,21,0.10),0_8px_24px_rgba(26,24,21,0.08),0_24px_60px_rgba(26,24,21,0.06)]">
          <div className="rounded-2xl bg-white p-8">
            <div className="space-y-4">
              <div className="h-3 w-3/4 rounded bg-[#1a1815]/10" />
              <div className="h-3 w-full rounded bg-[#1a1815]/8" />
              <div className="h-3 w-5/6 rounded bg-[#1a1815]/8" />
              <div className="mt-6 h-2.5 w-2/3 rounded bg-[#1a1815]/6" />
              <div className="h-2.5 w-full rounded bg-[#1a1815]/6" />
              <div className="h-2.5 w-4/5 rounded bg-[#1a1815]/6" />
              <div className="h-2.5 w-3/4 rounded bg-[#1a1815]/6" />
            </div>
          </div>
        </div>
      </div>

      {/* Dark section */}
      <div className="rounded-3xl bg-[#1a1815] px-8 py-16 text-center">
        <h2 className="font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.5rem,4vw,3rem)] text-[#faf5f2]">
          Specifications
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-12">
          {[
            ["10.5\"", "Display"],
            ["60Hz", "Refresh"],
            ["12hr", "Battery"],
          ].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl text-[#faf5f2]">{val}</p>
              <p className="text-xs text-[#8a8078]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Text block */}
      <div className="mx-auto max-w-2xl text-center">
        <blockquote className="font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,2rem)] leading-relaxed text-[#1a1815]">
          &ldquo;We believe your most important technology should not leave you
          feeling exhausted, distracted, or in pain.&rdquo;
        </blockquote>
      </div>
    </div>
  );
}

/* ─── Shadow overlay with leva controls ─── */
function ControlledShadowOverlay() {
  const [copied, setCopied] = useState(false);

  // Primary stripe controls
  const primary = useControls(
    "Primary Stripes",
    {
      enabled: true,
      angle: { value: -35, min: -90, max: 0, step: 1 },
      opacity: { value: 0.055, min: 0, max: 0.2, step: 0.005 },
      stripeWidth: { value: 16, min: 2, max: 60, step: 1 },
      gapWidth: { value: 45, min: 10, max: 150, step: 1 },
      softness: { value: 3, min: 0, max: 20, step: 1 },
    },
    { collapsed: false }
  );

  // Secondary stripe controls
  const secondary = useControls(
    "Secondary Stripes (Depth)",
    {
      enabled: true,
      angleOffset: { value: -5, min: -20, max: 20, step: 1 },
      opacity: { value: 0.035, min: 0, max: 0.15, step: 0.005 },
      stripeWidth: { value: 50, min: 10, max: 120, step: 1 },
      gapWidth: { value: 100, min: 30, max: 300, step: 5 },
      softness: { value: 5, min: 0, max: 30, step: 1 },
    },
    { collapsed: true }
  );

  // Light source controls
  const light = useControls(
    "Light Source",
    {
      enabled: true,
      positionX: { value: 70, min: 0, max: 100, step: 1 },
      positionY: { value: 10, min: 0, max: 100, step: 1 },
      intensity: { value: 0.18, min: 0, max: 0.6, step: 0.01 },
      spread: { value: 60, min: 20, max: 100, step: 5 },
      color: "#fff8eb",
    },
    { collapsed: true }
  );

  // Vignette controls
  const vignette = useControls(
    "Vignette",
    {
      enabled: true,
      opacity: { value: 0.03, min: 0, max: 0.1, step: 0.005 },
    },
    { collapsed: true }
  );

  // Global controls
  const global = useControls(
    "Global",
    {
      offsetX: { value: 0, min: -100, max: 100, step: 1 },
      offsetY: { value: 0, min: -100, max: 100, step: 1 },
    },
    { collapsed: true }
  );

  // Build gradient strings
  const shadows = useMemo(() => {
    const s = primary;
    const halfSoft = s.softness;
    const stripeStart = s.gapWidth;
    const softStart = stripeStart + halfSoft;
    const peakStart = softStart;
    const peakEnd = peakStart + s.stripeWidth;
    const softEnd = peakEnd + halfSoft;
    const totalRepeat = softEnd;

    const primaryGrad = `repeating-linear-gradient(
      ${s.angle}deg,
      transparent 0px,
      transparent ${stripeStart}px,
      rgba(26,24,21,${(s.opacity * 0.5).toFixed(4)}) ${softStart}px,
      rgba(26,24,21,${s.opacity.toFixed(4)}) ${peakStart}px,
      rgba(26,24,21,${s.opacity.toFixed(4)}) ${peakEnd}px,
      rgba(26,24,21,${(s.opacity * 0.5).toFixed(4)}) ${softEnd}px,
      transparent ${softEnd}px,
      transparent ${totalRepeat + s.gapWidth}px
    )`;

    const sec = secondary;
    const secAngle = primary.angle + sec.angleOffset;
    const secSoftStart = sec.gapWidth + sec.softness;
    const secPeakEnd = secSoftStart + sec.stripeWidth;
    const secSoftEnd = secPeakEnd + sec.softness;
    const secTotal = secSoftEnd + sec.gapWidth;

    const secondaryGrad = `repeating-linear-gradient(
      ${secAngle}deg,
      transparent 0px,
      transparent ${sec.gapWidth}px,
      rgba(26,24,21,${(sec.opacity * 0.5).toFixed(4)}) ${secSoftStart}px,
      rgba(26,24,21,${sec.opacity.toFixed(4)}) ${secSoftStart}px,
      rgba(26,24,21,${sec.opacity.toFixed(4)}) ${secPeakEnd}px,
      rgba(26,24,21,${(sec.opacity * 0.5).toFixed(4)}) ${secSoftEnd}px,
      transparent ${secSoftEnd}px,
      transparent ${secTotal}px
    )`;

    const warmLight = `radial-gradient(
      ellipse at ${light.positionX}% ${light.positionY}%,
      ${light.color}${Math.round(light.intensity * 255)
        .toString(16)
        .padStart(2, "0")} 0%,
      ${light.color}${Math.round(light.intensity * 0.3 * 255)
        .toString(16)
        .padStart(2, "0")} ${light.spread * 0.5}%,
      transparent ${light.spread}%
    )`;

    return { primaryGrad, secondaryGrad, warmLight };
  }, [primary, secondary, light]);

  // Export current config
  const exportConfig = useCallback(() => {
    const config = {
      primary: { ...primary },
      secondary: { ...secondary },
      light: { ...light },
      vignette: { ...vignette },
      global: { ...global },
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [primary, secondary, light, vignette, global]);

  useControls("Export", {
    "Copy Config to Clipboard": button(() => exportConfig()),
  });

  return (
    <>
      {copied && (
        <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-full bg-[#1a1815] px-5 py-2.5 text-sm text-[#faf5f2] shadow-lg">
          Config copied to clipboard
        </div>
      )}
      <div
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          transform: `translate(${global.offsetX}px, ${global.offsetY}px)`,
        }}
      >
        {/* Primary stripes */}
        {primary.enabled && (
          <div
            className="absolute inset-[-20%] h-[140%] w-[140%]"
            style={{ background: shadows.primaryGrad }}
          />
        )}
        {/* Secondary depth stripes */}
        {secondary.enabled && (
          <div
            className="absolute inset-[-20%] h-[140%] w-[140%]"
            style={{ background: shadows.secondaryGrad }}
          />
        )}
        {/* Warm light glow */}
        {light.enabled && (
          <div
            className="absolute inset-0"
            style={{ background: shadows.warmLight }}
          />
        )}
        {/* Vignette */}
        {vignette.enabled && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(26,24,21,${vignette.opacity}) 100%)`,
            }}
          />
        )}
      </div>
    </>
  );
}

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-[#faf5f2] font-sans text-[#1a1815] [&_::selection]:bg-[#c4a46a]/20">
      <style>{`html, body { background-color: #faf5f2 !important; }`}</style>

      <ControlledShadowOverlay />

      {/* Fixed back link */}
      <nav className="fixed left-0 top-0 z-50 w-full bg-[#faf5f2]/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/labs/daylight"
            className="text-xs text-[#8a8078] transition-colors hover:text-[#1a1815]"
          >
            &larr; back to daylight
          </Link>
          <span className="text-xs text-[#1a1815]/20">|</span>
          <span className="text-xs text-[#8a8078]">
            Shadow Playground
          </span>
        </div>
      </nav>

      <SampleContent />
    </div>
  );
}
