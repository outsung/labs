"use client";

import Link from "next/link";
import { useControls, button } from "leva";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

/* ─── Preset definitions ─── */
const PRESETS: { id: string; name: string; src: string }[] = [
  { id: "classic-blinds", name: "Classic", src: "" },
  { id: "venetian-blinds", name: "Blinds", src: "/presets/venetian-blinds.jpeg" },
  { id: "arched-panes", name: "Arched", src: "/presets/arched-panes.jpeg" },
  { id: "french-window", name: "French", src: "/presets/french-window.jpeg" },
  { id: "foliage", name: "Foliage", src: "/presets/foliage-window.jpeg" },
  { id: "ivy", name: "Ivy", src: "/presets/ivy-window.jpeg" },
  { id: "provincial", name: "Provincial", src: "/presets/provincial.jpeg" },
  { id: "orange-arch", name: "Arch", src: "/presets/orange-arch.jpeg" },
  { id: "curtained", name: "Curtain", src: "/presets/curtained.jpeg" },
];

/* ─── Sun angle from hour ─── */
function getSunAngle(hours: number): number {
  const t = Math.max(0, Math.min(1, (hours - 6) / 12));
  const arc = -4 * (t - 0.5) ** 2 + 1;
  return -45 + arc * 25;
}

/* ─── Deterministic pseudo-random ─── */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ─── Foliage shadows ─── */
function drawFoliageShadows(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opacity: number
) {
  const baseDepth = Math.round(0.2 * opacity * 255);
  if (baseDepth < 1) return;

  const branches = [
    { cx: 0.72, cy: 0.2, spread: 0.18, leaves: 16, seed: 1 },
    { cx: 0.88, cy: 0.4, spread: 0.14, leaves: 12, seed: 2 },
    { cx: 0.65, cy: 0.6, spread: 0.2, leaves: 18, seed: 3 },
    { cx: 0.92, cy: 0.12, spread: 0.1, leaves: 10, seed: 4 },
    { cx: 0.78, cy: 0.75, spread: 0.16, leaves: 14, seed: 5 },
    { cx: 0.55, cy: 0.35, spread: 0.12, leaves: 8, seed: 6 },
  ];

  for (const branch of branches) {
    for (let l = 0; l < branch.leaves; l++) {
      const s = branch.seed * 100 + l;
      const lx = (branch.cx + (seededRandom(s) - 0.5) * branch.spread) * w;
      const ly =
        (branch.cy + (seededRandom(s + 1) - 0.5) * branch.spread * 1.5) * h;
      const scale = w / 600;
      const lw = (3 + seededRandom(s + 2) * 10) * scale;
      const lh = (6 + seededRandom(s + 3) * 16) * scale;
      const angle = seededRandom(s + 4) * Math.PI;
      const leafDepth = Math.max(
        1,
        Math.round(baseDepth * (0.6 + seededRandom(s + 5) * 0.4))
      );

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.fillStyle = `rgb(${leafDepth}, 255, 0)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, lw, lh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/* ─── Left-to-right shadow gradient ─── */
function applyHorizontalGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 1] !== 255) continue;

      const factor = 0.03 + 0.97 * Math.pow(x / Math.max(1, w - 1), 2.0);
      const newDepth = Math.round(data[i] * factor);

      if (newDepth < 1) {
        data[i] = 0;
        data[i + 1] = 0;
      } else {
        data[i] = newDepth;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/* ─── Classic depth map (matches home page) ─── */
function generateClassicDepthMap(
  w: number,
  h: number,
  hour: number
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, w, h);

  const angleDeg = getSunAngle(hour);
  const angleRad = (angleDeg * Math.PI) / 180;

  const slatSpacing = 50;
  const tiltAngle = 65 * (Math.PI / 180);
  const slatWidth = slatSpacing * Math.cos(tiltAngle);

  // Foliage shadows (drawn first so slats cover them)
  drawFoliageShadows(ctx, w, h, 1);

  // Blind slats (pivot shifted right, same as home page)
  ctx.save();
  ctx.translate(w * 0.75, h / 2);
  ctx.scale(1.0, 1.5);
  ctx.rotate(angleRad);
  const count = Math.ceil((Math.max(w, h) * 2) / slatSpacing);
  for (let i = -count; i <= count; i++) {
    const depth = 0.3 + Math.sin(i * 1.37) * 0.08 + Math.cos(i * 0.73) * 0.05;
    const r = Math.round(Math.max(1, Math.min(255, depth * 255)));
    ctx.fillStyle = `rgb(${r}, 255, 0)`;
    ctx.fillRect(-w * 2, i * slatSpacing, w * 4, slatWidth);
  }
  ctx.restore();

  // Vertical bar
  const frameDepth = Math.round(0.65 * 255);
  ctx.save();
  ctx.translate(w * 0.75, h / 2);
  ctx.scale(1.0, 1.5);
  ctx.rotate(angleRad + Math.PI / 2);
  ctx.fillStyle = `rgb(${frameDepth}, 255, 0)`;
  ctx.fillRect(-w * 2, 0, w * 4, 10);
  ctx.restore();

  // Left-to-right gradient
  applyHorizontalGradient(ctx, w, h);

  return c;
}

/* ─── Image → Depth Map conversion ─── */
function processImageToDepthMap(
  sourceCanvas: HTMLCanvasElement,
  w: number,
  h: number,
  opts: { threshold: number; contrast: number; depth: number; invert: boolean }
): HTMLCanvasElement {
  const sourceCtx = sourceCanvas.getContext("2d")!;
  const imageData = sourceCtx.getImageData(0, 0, w, h);
  const { threshold, contrast, depth, invert } = opts;
  const { data } = imageData;
  const output = new ImageData(w, h);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    // RGB → luminance
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Contrast enhancement
    lum = ((lum / 255 - 0.5) * contrast + 0.5) * 255;
    lum = Math.max(0, Math.min(255, lum));

    // Invert (for exterior shots where window opening is dark)
    if (invert) lum = 255 - lum;

    if (lum > threshold) {
      // Light passes through — no shadow object
      output.data[i] = 0;
      output.data[i + 1] = 0;
      output.data[i + 2] = 0;
      output.data[i + 3] = 255;
    } else {
      // Shadow-casting object
      const depthVal = Math.round(
        depth * 255 * (1 - lum / Math.max(threshold, 1))
      );
      output.data[i] = Math.max(1, Math.min(255, depthVal));
      output.data[i + 1] = 255; // object flag
      output.data[i + 2] = 0;
      output.data[i + 3] = 255;
    }
  }

  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  outCanvas.getContext("2d")!.putImageData(output, 0, 0);
  return outCanvas;
}

/* ─── Draw image with cover fit ─── */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const imgAspect = img.width / img.height;
  const canvasAspect = w / h;
  let drawW: number, drawH: number, drawX: number, drawY: number;

  if (imgAspect > canvasAspect) {
    drawH = h;
    drawW = h * imgAspect;
  } else {
    drawW = w;
    drawH = w / imgAspect;
  }
  drawX = (w - drawW) / 2;
  drawY = (h - drawH) / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

/* ─── Page content (mirrors home page sections, static) ─── */
function SampleContent() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 pt-20 lg:px-[6vw]">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-6 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs">
            Window Shadow Experience
          </p>
          <h1 className="font-[Georgia,_'Times_New_Roman',serif] text-[clamp(3rem,8vw,7.5rem)] font-normal leading-[1.05] text-[#1a1815]">
            Turn any window
            <br />
            into light.
          </h1>
          <p className="mx-auto mt-8 max-w-lg text-base text-[#2a2520] lg:text-lg">
            Pick a window preset or upload your own photo to cast
            real-time shadows across the screen.
          </p>
        </div>
      </section>

      {/* ─── Mission Quote ─── */}
      <section className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-8 h-px w-16 bg-[#c4a46a]/40" />
          <blockquote className="font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,2rem)] leading-relaxed text-[#1a1815]">
            &ldquo;The most beautiful thing about light is how it turns
            ordinary spaces into something quietly extraordinary.&rdquo;
          </blockquote>
          <div className="mx-auto mt-8 h-px w-16 bg-[#c4a46a]/40" />
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="bg-[#f5ede8] px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-center font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs">
            How it works
          </p>
          <h2 className="mb-16 text-center font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#1a1815]">
            Light, computed
          </h2>
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {[
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <rect x="4" y="8" width="24" height="16" rx="2" stroke="#c4a46a" strokeWidth="1.5" />
                    <line x1="4" y1="14" x2="28" y2="14" stroke="#c4a46a" strokeWidth="1" opacity="0.5" />
                    <line x1="4" y1="18" x2="28" y2="18" stroke="#c4a46a" strokeWidth="1" opacity="0.3" />
                  </svg>
                ),
                title: "Depth mapping",
                description:
                  "Window photos are converted into depth maps. Light areas pass through; dark regions become shadow-casting objects with varying depth.",
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <circle cx="16" cy="16" r="10" stroke="#c4a46a" strokeWidth="1.5" />
                    <circle cx="16" cy="16" r="4" fill="#c4a46a" opacity="0.3" />
                  </svg>
                ),
                title: "Vogel disk sampling",
                description:
                  "100 samples per pixel distributed in a golden-angle spiral. Each sample checks the depth map for shadow influence, creating smooth, natural falloff.",
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <circle cx="16" cy="14" r="5" stroke="#c4a46a" strokeWidth="1.5" />
                    <line x1="16" y1="4" x2="16" y2="7" stroke="#c4a46a" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="16" y1="21" x2="16" y2="24" stroke="#c4a46a" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="14" x2="9" y2="14" stroke="#c4a46a" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="23" y1="14" x2="26" y2="14" stroke="#c4a46a" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
                title: "Warm-tinted shadows",
                description:
                  "Shadows are tinted with a warm off-white tone rather than cold gray, composited via multiply blend for a natural, sunlit atmosphere.",
              },
            ].map((b, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white p-8 shadow-[0_1px_2px_rgba(26,24,21,0.08),0_4px_12px_rgba(26,24,21,0.06),0_16px_40px_rgba(26,24,21,0.04)] lg:p-10"
              >
                <div className="mb-6">{b.icon}</div>
                <h3 className="mb-3 font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,1.5rem)] text-[#1a1815]">
                  {b.title}
                </h3>
                <p className="leading-relaxed text-[#2a2520]/70">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Specs ─── */}
      <section className="bg-[#1a1815] px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-center font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs">
            Under the hood
          </p>
          <h2 className="mb-16 text-center font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#faf5f2]">
            The shader
          </h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-5 lg:gap-4">
            {[
              { value: "100", label: "Samples / px" },
              { value: "WebGL", label: "Rendering" },
              { value: "0.33x", label: "Render Scale" },
              { value: "60fps", label: "Target" },
              { value: "Vogel", label: "Disk Sampling" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-[#d4b87a22] p-6 text-center lg:p-8"
              >
                <p className="font-[Georgia,_'Times_New_Roman',serif] text-2xl text-[#faf5f2] lg:text-3xl">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-[#8a8078]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Demo Content ─── */}
      <section className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
        <div className="mx-auto max-w-7xl space-y-24 lg:space-y-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-3 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs">
                Programmatic
              </p>
              <h3 className="mb-4 font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,2rem)] text-[#1a1815]">
                Classic blind slats
              </h3>
              <p className="max-w-md leading-relaxed text-[#2a2520]/70">
                The original shadow mode generates venetian blind slats with
                window frame crossbars directly in code. The sun angle shifts
                with time of day for a living, dynamic effect.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(26,24,21,0.08),0_4px_12px_rgba(26,24,21,0.06),0_16px_40px_rgba(26,24,21,0.04)] lg:p-8">
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

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 lg:[direction:rtl]">
            <div className="lg:[direction:ltr]">
              <p className="mb-3 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs">
                Image-based
              </p>
              <h3 className="mb-4 font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,2rem)] text-[#1a1815]">
                Any window, any shape
              </h3>
              <p className="max-w-md leading-relaxed text-[#2a2520]/70">
                Upload a window photo or pick from presets — arched panes,
                foliage-covered frames, French windows. Each image is processed
                into a depth map that the shader renders as realistic shadows.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:[direction:ltr]">
              {[
                { color: "bg-[#585b3d]/10", h: "h-20" },
                { color: "bg-[#c4a46a]/10", h: "h-24" },
                { color: "bg-[#272819]/8", h: "h-28" },
                { color: "bg-[#434626]/10", h: "h-20" },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`${card.h} rounded-xl ${card.color} p-4 shadow-[0_1px_3px_rgba(26,24,21,0.04),0_4px_8px_rgba(26,24,21,0.03)]`}
                >
                  <div className="mb-2 h-2 w-3/4 rounded bg-[#1a1815]/10" />
                  <div className="h-1.5 w-full rounded bg-[#1a1815]/5" />
                  <div className="mt-1 h-1.5 w-4/5 rounded bg-[#1a1815]/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border border-[#c4a46a]/20" />
              <div className="absolute inset-2 rounded-full border border-[#c4a46a]/30" />
              <div className="absolute inset-4 rounded-full bg-[#c4a46a]/15" />
              <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-[#c4a46a]/40" />
              <div className="absolute -bottom-3 left-1/2 h-3 w-px -translate-x-1/2 bg-[#c4a46a]/40" />
              <div className="absolute -left-3 top-1/2 h-px w-3 -translate-y-1/2 bg-[#c4a46a]/40" />
              <div className="absolute -right-3 top-1/2 h-px w-3 -translate-y-1/2 bg-[#c4a46a]/40" />
            </div>
          </div>
          <h2 className="mb-6 font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#1a1815]">
            Light shapes everything
          </h2>
          <p className="mx-auto max-w-xl leading-relaxed text-[#2a2520]/70">
            Adjust the Leva controls to tune the Vogel Disk Sampling shadow
            shader. Pick a preset below or upload your own window photo.
          </p>
        </div>
      </section>
    </>
  );
}

/* ─── Preset selector bar ─── */
function PresetBar({
  presets,
  selected,
  onSelect,
  onUpload,
  visible,
}: {
  presets: { id: string; name: string; src: string }[];
  selected: string;
  onSelect: (id: string) => void;
  onUpload: (file: File) => void;
  visible: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1.5 rounded-2xl bg-white/90 p-2 shadow-[0_2px_8px_rgba(26,24,21,0.12),0_8px_32px_rgba(26,24,21,0.08)] backdrop-blur-sm">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={`relative h-11 w-11 overflow-hidden rounded-lg transition-all ${
              selected === preset.id
                ? "ring-2 ring-[#1a1815] ring-offset-1"
                : "opacity-50 hover:opacity-90"
            }`}
            title={preset.name}
          >
            {preset.src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preset.src}
                alt={preset.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f0e8e0] to-[#e8ddd4]">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" className="text-[#8a8078]">
                  <rect x="4" y="5" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="4" y1="9" x2="24" y2="9" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                  <line x1="4" y1="13" x2="24" y2="13" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                  <line x1="4" y1="17" x2="24" y2="17" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                  <line x1="4" y1="21" x2="24" y2="21" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                </svg>
              </div>
            )}
          </button>
        ))}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-dashed border-[#1a1815]/15 text-[#1a1815]/30 transition-colors hover:border-[#1a1815]/30 hover:text-[#1a1815]/50"
          title="Upload image"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 3v12M3 9h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
      </div>
    </div>
  );
}

/* ─── WebGL Shadow Overlay with leva controls ─── */
function ControlledShadowOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const quadBufRef = useRef<WebGLBuffer | null>(null);
  const depthTexRef = useRef<WebGLTexture | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id);
  const [customPresets, setCustomPresets] = useState<
    { id: string; name: string; src: string }[]
  >([]);
  const [imageReady, setImageReady] = useState(0);

  const allPresets = useMemo(
    () => [...PRESETS, ...customPresets],
    [customPresets]
  );

  // ── Source mode ──
  const [{ mode }, setSource] = useControls("Source", () => ({
    mode: { value: "programmatic", options: ["image", "programmatic"] },
  }));

  // ── Sync preset selection with Leva mode ──
  const handlePresetSelect = useCallback(
    (id: string) => {
      setSelectedPreset(id);
      const preset = [...PRESETS, ...customPresets].find((p) => p.id === id);
      if (preset) {
        const newMode = preset.src === "" ? "programmatic" : "image";
        setSource({ mode: newMode });
      }
    },
    [customPresets, setSource]
  );

  // ── Sync Leva mode change → select appropriate preset ──
  const prevModeRef = useRef(mode);
  useEffect(() => {
    if (mode === prevModeRef.current) return;
    prevModeRef.current = mode;

    const currentPreset = allPresets.find((p) => p.id === selectedPreset);
    const currentIsClassic = currentPreset?.src === "";

    if (mode === "programmatic" && !currentIsClassic) {
      setSelectedPreset("classic-blinds");
    } else if (mode === "image" && currentIsClassic) {
      const firstImage = allPresets.find((p) => p.src !== "");
      if (firstImage) setSelectedPreset(firstImage.id);
    }
  }, [mode, selectedPreset, allPresets]);

  // ── Shader parameters ──
  const shader = useControls(
    "Shader",
    {
      diskSize: { value: 80, min: 10, max: 200, step: 5 },
      diskSamples: { value: 100, min: 20, max: 200, step: 10 },
      minSize: { value: 20, min: 1, max: 100, step: 1 },
      maxSize: { value: 300, min: 50, max: 600, step: 10 },
      maxShadow: { value: 0.8, min: 0.1, max: 1.0, step: 0.05 },
      influenceClose: { value: 8.0, min: 1.0, max: 20.0, step: 0.5 },
      influenceFar: { value: 0.5, min: 0.1, max: 5.0, step: 0.1 },
    },
    { collapsed: true }
  );

  const shadowColor = useControls(
    "Shadow Tint",
    {
      r: { value: 0.92, min: 0.3, max: 1.0, step: 0.01 },
      g: { value: 0.90, min: 0.3, max: 1.0, step: 0.01 },
      b: { value: 0.88, min: 0.3, max: 1.0, step: 0.01 },
    },
    { collapsed: true }
  );

  // ── Image processing parameters ──
  const imageOpts = useControls(
    "Image Processing",
    {
      threshold: { value: 128, min: 0, max: 255, step: 1 },
      contrast: { value: 1.8, min: 0.5, max: 5.0, step: 0.1 },
      depth: { value: 0.4, min: 0.05, max: 1.0, step: 0.05 },
      invert: false,
    },
    { collapsed: false }
  );

  const defaultHourRef = useRef(() => {
    const now = new Date();
    return now.getHours() + Math.round(now.getMinutes() / 30) * 0.5;
  });

  const sunTime = useControls(
    "Sun / Time",
    {
      hour: { value: defaultHourRef.current(), min: 0, max: 24, step: 0.5 },
    },
    { collapsed: false }
  );

  const rendering = useControls(
    "Rendering",
    {
      scale: { value: 0.33, min: 0.15, max: 1.0, step: 0.05 },
    },
    { collapsed: true }
  );

  const debug = useControls(
    "Debug",
    {
      showDepthMap: false,
    },
    { collapsed: true }
  );

  // ── Export config ──
  const exportConfig = useCallback(() => {
    const config = {
      mode,
      shader,
      shadowColor,
      imageOpts,
      rendering,
      sunTime,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [mode, shader, shadowColor, imageOpts, rendering, sunTime]);

  useControls("Export", {
    "Copy Config": button(() => exportConfig()),
  });

  // ── Load preset image ──
  useEffect(() => {
    if (mode !== "image") return;
    const preset = allPresets.find((p) => p.id === selectedPreset);
    if (!preset) return;

    if (imageCacheRef.current.has(preset.src)) {
      setImageReady((v) => v + 1);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCacheRef.current.set(preset.src, img);
      setImageReady((v) => v + 1);
    };
    img.onerror = () => console.error("Failed to load preset:", preset.src);
    img.src = preset.src;
  }, [mode, selectedPreset, allPresets]);

  // ── Handle file upload ──
  const handleUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const id = `custom-${Date.now()}`;
    const name = file.name.replace(/\.[^.]+$/, "").slice(0, 10);

    // Pre-load the image before switching
    const img = new Image();
    img.onload = () => {
      imageCacheRef.current.set(url, img);
      setCustomPresets((prev) => [...prev, { id, name, src: url }]);
      setSelectedPreset(id);
      setSource({ mode: "image" });
      setImageReady((v) => v + 1);
    };
    img.src = url;
  }, [setSource]);

  // ── Init WebGL once ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      alpha: false,
    });
    if (!gl) return;
    glRef.current = gl;

    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    quadBufRef.current = quadBuf;

    return () => {
      if (depthTexRef.current) gl.deleteTexture(depthTexRef.current);
      if (programRef.current) gl.deleteProgram(programRef.current);
      if (quadBufRef.current) gl.deleteBuffer(quadBufRef.current);
    };
  }, []);

  // ── Re-compile shader & re-render when any control changes ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    // ─ Build fragment shader with current params baked in ─
    const fragmentSource = `
      precision highp float;
      uniform sampler2D uDepthMap;
      uniform float uWidth;
      uniform float uHeight;
      varying vec2 vTexCoord;

      const float pi = 3.14159265358979;
      const float goldenAngle = pi * (3.0 - sqrt(5.0));
      const float diskSize = ${(shader.diskSize * (mode === "programmatic" ? rendering.scale : 1.0)).toFixed(1)};
      const int diskSamples = ${shader.diskSamples};
      const float minSize = ${(shader.minSize * (mode === "programmatic" ? rendering.scale : 1.0)).toFixed(1)};
      const float maxSize = ${(shader.maxSize * (mode === "programmatic" ? rendering.scale : 1.0)).toFixed(1)};
      const float maxShadow = ${shader.maxShadow.toFixed(2)};
      const float influenceClose = ${shader.influenceClose.toFixed(1)};
      const float influenceFar = ${shader.influenceFar.toFixed(1)};
      const vec3 shadowTint = vec3(${shadowColor.r.toFixed(3)}, ${shadowColor.g.toFixed(3)}, ${shadowColor.b.toFixed(3)});

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

        for (int i = 1; i <= ${shader.diskSamples}; i++) {
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
              shadowInfluence += mix(influenceClose, influenceFar, size / maxSize);
            }
          }
        }

        float shadowFactor = shadowInfluence / float(diskSamples);
        shadowFactor = clamp(shadowFactor, 0.0, maxShadow);

        vec3 color = mix(vec3(1.0), shadowTint, shadowFactor);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const vertexSource = `
      attribute vec2 aPosition;
      varying vec2 vTexCoord;
      void main() {
        vTexCoord = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // ─ Compile ─
    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error("Shader error:", gl!.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return;

    if (programRef.current) gl.deleteProgram(programRef.current);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Link error:", gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    // ─ Set up canvas size ─
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(window.innerWidth * rendering.scale * dpr);
    const h = Math.round(window.innerHeight * rendering.scale * dpr);
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);

    // ─ Generate depth map ─
    const depthCanvas = document.createElement("canvas");
    depthCanvas.width = w;
    depthCanvas.height = h;
    const ctx = depthCanvas.getContext("2d")!;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, w, h);

    if (mode === "image") {
      // Image-based depth map
      const preset = allPresets.find((p) => p.id === selectedPreset);
      const img = preset ? imageCacheRef.current.get(preset.src) : null;
      if (!img) return; // not loaded yet

      // Draw image to temp canvas (cover fit)
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext("2d")!;
      drawImageCover(tempCtx, img, w, h);

      // Convert to depth map
      const processed = processImageToDepthMap(tempCanvas, w, h, imageOpts);
      ctx.drawImage(processed, 0, 0);
    } else {
      // Classic / programmatic mode — same as home page
      const classicDepth = generateClassicDepthMap(w, h, sunTime.hour);
      ctx.drawImage(classicDepth, 0, 0);
    }

    // ─ Debug depth map preview ─
    if (debug.showDepthMap && debugCanvasRef.current) {
      const dbg = debugCanvasRef.current;
      dbg.width = w;
      dbg.height = h;
      dbg.getContext("2d")!.drawImage(depthCanvas, 0, 0);
    }

    // ─ Upload depth texture ─
    if (depthTexRef.current) gl.deleteTexture(depthTexRef.current);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      depthCanvas
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    depthTexRef.current = tex;

    // ─ Render ─
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(program, "uDepthMap"), 0);
    gl.uniform1f(gl.getUniformLocation(program, "uWidth"), w);
    gl.uniform1f(gl.getUniformLocation(program, "uHeight"), h);

    const aPos = gl.getAttribLocation(program, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBufRef.current);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [
    shader,
    shadowColor,
    mode,
    selectedPreset,
    imageOpts,
    rendering,
    sunTime,
    debug.showDepthMap,
    imageReady,
    allPresets,
  ]);

  // ── Handle resize ──
  useEffect(() => {
    const onResize = () => setImageReady((v) => v + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      {copied && (
        <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-full bg-[#1a1815] px-5 py-2.5 text-sm text-[#faf5f2] shadow-lg">
          Config copied to clipboard
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-40 h-full w-full"
        style={{ mixBlendMode: "multiply" }}
      />
      {debug.showDepthMap && (
        <canvas
          ref={debugCanvasRef}
          className="fixed bottom-24 right-6 z-50 h-36 w-52 rounded-xl border border-[#1a1815]/10 bg-black shadow-lg"
          style={{ imageRendering: "pixelated" }}
        />
      )}
      <PresetBar
        presets={allPresets}
        selected={selectedPreset}
        onSelect={handlePresetSelect}
        onUpload={handleUpload}
        visible={true}
      />
    </>
  );
}

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-[#faf5f2] font-sans text-[#1a1815] [&_::selection]:bg-[#c4a46a]/20">
      <style>{`html, body { background-color: #faf5f2 !important; }`}</style>

      <ControlledShadowOverlay />

      <nav className="fixed left-0 top-0 z-50 w-full bg-[#faf5f2]/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/labs/penumbra"
            className="text-xs text-[#8a8078] transition-colors hover:text-[#1a1815]"
          >
            &larr; back to penumbra
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
