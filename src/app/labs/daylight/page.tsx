"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT_QUINT },
  },
};

function CharacterReveal({
  text,
  className,
  delay = 0.6,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const chars = text.split("");
  return (
    <span className={className}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{
            delay: delay + i * 0.03,
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

/* ─── Preset definitions ─── */
type ShadowMode = "programmatic" | "image";

interface PresetSettings {
  threshold: number;
  contrast: number;
  depth: number;
  invert: boolean;
}

interface Preset {
  id: string;
  name: string;
  mode: ShadowMode;
  src: string; // empty for programmatic
  settings: PresetSettings;
}

const DEFAULT_SETTINGS: PresetSettings = {
  threshold: 128,
  contrast: 1.8,
  depth: 0.4,
  invert: false,
};

const PRESETS: Preset[] = [
  {
    id: "classic-blinds",
    name: "Classic",
    mode: "programmatic",
    src: "",
    settings: { threshold: 0, contrast: 0, depth: 0, invert: false },
  },
  {
    id: "venetian-blinds",
    name: "Blinds",
    mode: "image",
    src: "/presets/venetian-blinds.jpeg",
    settings: { threshold: 140, contrast: 2.0, depth: 0.35, invert: false },
  },
  {
    id: "arched-panes",
    name: "Arched",
    mode: "image",
    src: "/presets/arched-panes.jpeg",
    settings: { threshold: 120, contrast: 2.2, depth: 0.4, invert: false },
  },
  {
    id: "french-window",
    name: "French",
    mode: "image",
    src: "/presets/french-window.jpeg",
    settings: { threshold: 135, contrast: 1.8, depth: 0.45, invert: false },
  },
  {
    id: "foliage",
    name: "Foliage",
    mode: "image",
    src: "/presets/foliage-window.jpeg",
    settings: { threshold: 110, contrast: 2.5, depth: 0.3, invert: false },
  },
  {
    id: "ivy",
    name: "Ivy",
    mode: "image",
    src: "/presets/ivy-window.jpeg",
    settings: { threshold: 105, contrast: 2.4, depth: 0.35, invert: false },
  },
  {
    id: "provincial",
    name: "Provincial",
    mode: "image",
    src: "/presets/provincial.jpeg",
    settings: { threshold: 130, contrast: 1.6, depth: 0.5, invert: false },
  },
  {
    id: "orange-arch",
    name: "Arch",
    mode: "image",
    src: "/presets/orange-arch.jpeg",
    settings: { threshold: 145, contrast: 1.9, depth: 0.4, invert: true },
  },
  {
    id: "curtained",
    name: "Curtain",
    mode: "image",
    src: "/presets/curtained.jpeg",
    settings: { threshold: 125, contrast: 2.0, depth: 0.45, invert: false },
  },
];

/* ─── Programmatic depth map (original blind slats) ─── */
function generateProgrammaticDepthMap(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, w, h);

  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  const t = Math.max(0, Math.min(1, (hours - 6) / 12));
  const arc = -4 * (t - 0.5) ** 2 + 1;
  const angleDeg = -45 + arc * 25;
  const angleRad = (angleDeg * Math.PI) / 180;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(angleRad);

  const slatSpacing = 50;
  const slatWidth = 5;
  const count = Math.ceil((Math.max(w, h) * 2) / slatSpacing);

  for (let i = -count; i <= count; i++) {
    const depth =
      0.3 + Math.sin(i * 1.37) * 0.08 + Math.cos(i * 0.73) * 0.05;
    const r = Math.round(Math.max(1, Math.min(255, depth * 255)));
    ctx.fillStyle = `rgb(${r}, 255, 0)`;
    ctx.fillRect(-w * 2, i * slatSpacing, w * 4, slatWidth);
  }

  const frameDepth = Math.round(0.65 * 255);
  ctx.fillStyle = `rgb(${frameDepth}, 255, 0)`;
  ctx.fillRect(-w * 2, -h * 0.15, w * 4, 10);
  ctx.fillRect(-w * 2, h * 0.35, w * 4, 10);
  ctx.restore();

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(angleRad + Math.PI / 2);
  ctx.fillStyle = `rgb(${frameDepth}, 255, 0)`;
  ctx.fillRect(-w * 2, 0, w * 4, 10);
  ctx.restore();

  return c;
}

/* ─── Image → Depth Map conversion ─── */
function processImageToDepthMap(
  sourceCanvas: HTMLCanvasElement,
  w: number,
  h: number,
  opts: PresetSettings
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

    let lum = 0.299 * r + 0.587 * g + 0.114 * b;
    lum = ((lum / 255 - 0.5) * contrast + 0.5) * 255;
    lum = Math.max(0, Math.min(255, lum));

    if (invert) lum = 255 - lum;

    if (lum > threshold) {
      output.data[i] = 0;
      output.data[i + 1] = 0;
      output.data[i + 2] = 0;
      output.data[i + 3] = 255;
    } else {
      const depthVal = Math.round(
        depth * 255 * (1 - lum / Math.max(threshold, 1))
      );
      output.data[i] = Math.max(1, Math.min(255, depthVal));
      output.data[i + 1] = 255;
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

/* ─── WebGL Shadow Overlay ─── */
function ShadowOverlay({
  selectedPreset,
  settings,
  imageReady,
  allPresets,
}: {
  selectedPreset: string;
  settings: PresetSettings;
  imageReady: number;
  allPresets: Preset[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const quadBufRef = useRef<WebGLBuffer | null>(null);
  const depthTexRef = useRef<WebGLTexture | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [internalReady, setInternalReady] = useState(0);

  // Load preset image (skip for programmatic)
  useEffect(() => {
    const preset = allPresets.find((p) => p.id === selectedPreset);
    if (!preset || preset.mode === "programmatic") {
      setInternalReady((v) => v + 1);
      return;
    }

    if (imageCacheRef.current.has(preset.src)) {
      setInternalReady((v) => v + 1);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCacheRef.current.set(preset.src, img);
      setInternalReady((v) => v + 1);
    };
    img.onerror = () => console.error("Failed to load preset:", preset.src);
    img.src = preset.src;
  }, [selectedPreset, allPresets]);

  // Init WebGL once
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

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    const RENDER_SCALE = 0.33;

    const vertexSource = `
      attribute vec2 aPosition;
      varying vec2 vTexCoord;
      void main() {
        vTexCoord = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

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

        for (int i = 1; i <= 100; i++) {
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

        vec3 color = mix(vec3(1.0), vec3(0.92, 0.90, 0.88), shadowFactor);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

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

    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(window.innerWidth * RENDER_SCALE * dpr);
    const h = Math.round(window.innerHeight * RENDER_SCALE * dpr);
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);

    // Generate depth map
    const preset = allPresets.find((p) => p.id === selectedPreset);
    let depthCanvas: HTMLCanvasElement;

    if (!preset || preset.mode === "programmatic") {
      depthCanvas = generateProgrammaticDepthMap(w, h);
    } else {
      const img = imageCacheRef.current.get(preset.src);
      if (!img) return;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.fillStyle = "rgb(0, 0, 0)";
      tempCtx.fillRect(0, 0, w, h);
      drawImageCover(tempCtx, img, w, h);
      depthCanvas = processImageToDepthMap(tempCanvas, w, h, settings);
    }

    // Upload depth texture
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

    // Render
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
  }, [selectedPreset, settings, imageReady, internalReady, allPresets]);

  // Handle resize
  useEffect(() => {
    const onResize = () => setInternalReady((v) => v + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}

/* ─── Settings Panel ─── */
function SettingsPanel({
  open,
  onClose,
  settings,
  onSettingsChange,
  isProgrammatic,
}: {
  open: boolean;
  onClose: () => void;
  settings: PresetSettings;
  onSettingsChange: (s: PresetSettings) => void;
  isProgrammatic: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/10"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: EASE_OUT_QUINT }}
            className="fixed bottom-0 right-0 top-0 z-50 w-80 overflow-y-auto border-l border-[#1a1815]/10 bg-[#faf5f2] p-6 shadow-[-4px_0_24px_rgba(26,24,21,0.08)]"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-[Georgia,_'Times_New_Roman',serif] text-lg text-[#1a1815]">
                Settings
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a8078] transition-colors hover:bg-[#1a1815]/5 hover:text-[#1a1815]"
                aria-label="Close settings"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {isProgrammatic ? (
              <div className="rounded-xl border border-[#c4a46a]/20 bg-[#c4a46a]/5 p-5">
                <p className="text-sm text-[#1a1815]">Classic Mode</p>
                <p className="mt-2 text-[12px] leading-relaxed text-[#8a8078]">
                  Programmatic blind slat shadows with time-based sun angle.
                  This mode uses code-generated depth maps — no image processing
                  settings needed.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm text-[#1a1815]">Threshold</label>
                    <span className="tabular-nums text-xs text-[#8a8078]">
                      {settings.threshold}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    step={1}
                    value={settings.threshold}
                    onChange={(e) =>
                      onSettingsChange({
                        ...settings,
                        threshold: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#1a1815]"
                  />
                  <p className="mt-1 text-[11px] text-[#8a8078]">
                    Brightness cutoff for shadow detection
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm text-[#1a1815]">Contrast</label>
                    <span className="tabular-nums text-xs text-[#8a8078]">
                      {settings.contrast.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={5.0}
                    step={0.1}
                    value={settings.contrast}
                    onChange={(e) =>
                      onSettingsChange({
                        ...settings,
                        contrast: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#1a1815]"
                  />
                  <p className="mt-1 text-[11px] text-[#8a8078]">
                    Enhance light/dark separation
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm text-[#1a1815]">Depth</label>
                    <span className="tabular-nums text-xs text-[#8a8078]">
                      {settings.depth.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={1.0}
                    step={0.05}
                    value={settings.depth}
                    onChange={(e) =>
                      onSettingsChange({
                        ...settings,
                        depth: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#1a1815]"
                  />
                  <p className="mt-1 text-[11px] text-[#8a8078]">
                    Shadow softness — closer objects cast sharper shadows
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#1a1815]/10 px-4 py-3">
                  <div>
                    <label className="text-sm text-[#1a1815]">Invert</label>
                    <p className="text-[11px] text-[#8a8078]">
                      For exterior or inverted photos
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        invert: !settings.invert,
                      })
                    }
                    className={`relative h-6 w-10 rounded-full transition-colors ${
                      settings.invert ? "bg-[#1a1815]" : "bg-[#1a1815]/15"
                    }`}
                    role="switch"
                    aria-checked={settings.invert}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        settings.invert ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Preset Gallery ─── */
function PresetGallery({
  presets,
  selected,
  onSelect,
}: {
  presets: Preset[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
      {presets.map((preset, i) => (
        <motion.button
          key={preset.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8 + i * 0.05,
            duration: 0.5,
            ease: EASE_OUT_QUINT,
          }}
          onClick={() => onSelect(preset.id)}
          className={`group relative aspect-square overflow-hidden rounded-xl transition-all ${
            selected === preset.id
              ? "ring-2 ring-[#1a1815] ring-offset-2 ring-offset-[#faf5f2]"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          {preset.mode === "programmatic" ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f0e8e0] to-[#e8ddd4]">
              {/* Blind slat icon */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                className="text-[#8a8078]"
              >
                <rect
                  x="4"
                  y="5"
                  width="20"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <line
                  x1="4"
                  y1="9"
                  x2="24"
                  y2="9"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
                <line
                  x1="4"
                  y1="13"
                  x2="24"
                  y2="13"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
                <line
                  x1="4"
                  y1="17"
                  x2="24"
                  y2="17"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
                <line
                  x1="4"
                  y1="21"
                  x2="24"
                  y2="21"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
              </svg>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preset.src}
              alt={preset.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2 pb-1.5 pt-5">
            <span className="text-[10px] font-medium text-white">
              {preset.name}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Upload Zone ─── */
function UploadZone({ onUpload }: { onUpload: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-6 text-center transition-colors ${
        dragging
          ? "border-[#1a1815]/40 bg-[#1a1815]/5"
          : "border-[#1a1815]/10 hover:border-[#1a1815]/25"
      }`}
    >
      <p className="text-sm text-[#8a8078]">
        이미지를 드래그하거나 클릭하여 업로드
      </p>
      <p className="mt-1 text-[11px] text-[#8a8078]/50">JPG, PNG, WebP</p>
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
  );
}

/* ─── Main Page ─── */
export default function DaylightPage() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id);
  const [settings, setSettings] = useState<PresetSettings>(PRESETS[0].settings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageReady, setImageReady] = useState(0);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);

  const allPresets = useMemo(
    () => [...PRESETS, ...customPresets],
    [customPresets]
  );

  const currentPreset = useMemo(
    () => allPresets.find((p) => p.id === selectedPreset),
    [allPresets, selectedPreset]
  );

  const handleSelectPreset = useCallback(
    (id: string) => {
      setSelectedPreset(id);
      const preset = [...PRESETS, ...customPresets].find((p) => p.id === id);
      if (preset) setSettings(preset.settings);
    },
    [customPresets]
  );

  const handleUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const id = `custom-${Date.now()}`;
    const name = file.name.replace(/\.[^.]+$/, "").slice(0, 12);

    const img = new Image();
    img.onload = () => {
      const newPreset: Preset = {
        id,
        name,
        mode: "image",
        src: url,
        settings: { ...DEFAULT_SETTINGS },
      };
      setCustomPresets((prev) => [...prev, newPreset]);
      setSelectedPreset(id);
      setSettings({ ...DEFAULT_SETTINGS });
      setImageReady((v) => v + 1);
    };
    img.src = url;
  }, []);

  return (
    <div className="min-h-screen scroll-smooth bg-[#faf5f2] font-sans text-[#1a1815] [&_::selection]:bg-[#c4a46a]/20">
      <style>{`html, body { background-color: #faf5f2 !important; }`}</style>

      <ShadowOverlay
        selectedPreset={selectedPreset}
        settings={settings}
        imageReady={imageReady}
        allPresets={allPresets}
      />

      {/* ─── Nav ─── */}
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1a1815]/15 text-[#8a8078] transition-colors hover:border-[#1a1815]/30 hover:text-[#1a1815]"
              aria-label="Open settings"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.17 3.17l1.41 1.41M11.42 11.42l1.41 1.41M3.17 12.83l1.41-1.41M11.42 4.58l1.41-1.41"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ─── Settings Panel ─── */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        isProgrammatic={currentPreset?.mode === "programmatic"}
      />

      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 pt-20 lg:px-[6vw]">
        <div className="mx-auto max-w-7xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: EASE_OUT_QUINT }}
            className="mb-6 font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs"
          >
            Window Shadow Experience
          </motion.p>

          <h1 className="overflow-hidden font-[Georgia,_'Times_New_Roman',serif] text-[clamp(3rem,8vw,7.5rem)] font-normal leading-[1.05] text-[#1a1815]">
            <CharacterReveal text="Turn any window" />
            <br />
            <CharacterReveal text="into light." delay={0.9} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6, ease: EASE_OUT_QUINT }}
            className="mx-auto mt-8 max-w-lg text-base text-[#2a2520] lg:text-lg"
          >
            창문 사진을 선택하거나 업로드하면 실시간으로 그림자가 화면에
            드리워집니다.
          </motion.p>
        </div>
      </section>

      {/* ─── Preset Gallery Section ─── */}
      <section className="px-6 py-[4vh] lg:px-[6vw]">
        <div className="mx-auto max-w-7xl">
          <motion.p
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-4 text-center font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs"
          >
            Choose a window
          </motion.p>
          <motion.h2
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-10 text-center font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#1a1815]"
          >
            Select a shadow
          </motion.h2>

          <PresetGallery
            presets={allPresets}
            selected={selectedPreset}
            onSelect={handleSelectPreset}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-6"
          >
            <UploadZone onUpload={handleUpload} />
          </motion.div>
        </div>
      </section>

      {/* ─── Mission Quote ─── */}
      <motion.section
        variants={sectionAnim}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]"
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-8 h-px w-16 bg-[#c4a46a]/40" />
          <blockquote className="font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,2rem)] leading-relaxed text-[#1a1815]">
            &ldquo;The most beautiful thing about daylight is how it turns
            ordinary spaces into something quietly extraordinary.&rdquo;
          </blockquote>
          <div className="mx-auto mt-8 h-px w-16 bg-[#c4a46a]/40" />
        </div>
      </motion.section>

      {/* ─── Benefits / How it works ─── */}
      <section className="bg-[#f5ede8] px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
        <div className="mx-auto max-w-7xl">
          <motion.p
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-4 text-center font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs"
          >
            How it works
          </motion.p>
          <motion.h2
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#1a1815]"
          >
            Light, computed
          </motion.h2>
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {[
              {
                icon: (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="8"
                      width="24"
                      height="16"
                      rx="2"
                      stroke="#c4a46a"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="4"
                      y1="14"
                      x2="28"
                      y2="14"
                      stroke="#c4a46a"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                    <line
                      x1="4"
                      y1="18"
                      x2="28"
                      y2="18"
                      stroke="#c4a46a"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  </svg>
                ),
                title: "Depth mapping",
                description:
                  "Window photos are converted into depth maps. Light areas pass through; dark regions become shadow-casting objects with varying depth.",
              },
              {
                icon: (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="10"
                      stroke="#c4a46a"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="4"
                      fill="#c4a46a"
                      opacity="0.3"
                    />
                  </svg>
                ),
                title: "Vogel disk sampling",
                description:
                  "100 samples per pixel distributed in a golden-angle spiral. Each sample checks the depth map for shadow influence, creating smooth, natural falloff.",
              },
              {
                icon: (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="16"
                      cy="14"
                      r="5"
                      stroke="#c4a46a"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="16"
                      y1="4"
                      x2="16"
                      y2="7"
                      stroke="#c4a46a"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="16"
                      y1="21"
                      x2="16"
                      y2="24"
                      stroke="#c4a46a"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="6"
                      y1="14"
                      x2="9"
                      y2="14"
                      stroke="#c4a46a"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="23"
                      y1="14"
                      x2="26"
                      y2="14"
                      stroke="#c4a46a"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                title: "Warm-tinted shadows",
                description:
                  "Shadows are tinted with a warm off-white tone rather than cold gray, composited via multiply blend for a natural, sunlit atmosphere.",
              },
            ].map((b, i) => (
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
                <p className="leading-relaxed text-[#2a2520]/70">
                  {b.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Specs ─── */}
      <section className="bg-[#1a1815] px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
        <div className="mx-auto max-w-7xl">
          <motion.p
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-4 text-center font-sans text-[11px] uppercase tracking-[0.25em] text-[#8a8078] lg:text-xs"
          >
            Under the hood
          </motion.p>
          <motion.h2
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center font-[Georgia,_'Times_New_Roman',serif] text-[clamp(2rem,5vw,4rem)] text-[#faf5f2]"
          >
            The shader
          </motion.h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-5 lg:gap-4">
            {[
              { value: "100", label: "Samples / px" },
              { value: "WebGL", label: "Rendering" },
              { value: "0.33x", label: "Render Scale" },
              { value: "60fps", label: "Target" },
              { value: "Vogel", label: "Disk Sampling" },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={sectionAnim}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center rounded-2xl border border-[#d4b87a22] p-6 text-center lg:p-8"
              >
                <p className="font-[Georgia,_'Times_New_Roman',serif] text-2xl text-[#faf5f2] lg:text-3xl">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-[#8a8078]">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Demo Content ─── */}
      <section className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]">
        <div className="mx-auto max-w-7xl space-y-24 lg:space-y-32">
          <motion.div
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
          >
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
          </motion.div>

          <motion.div
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 lg:[direction:rtl]"
          >
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
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <motion.section
        variants={sectionAnim}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-6 py-[8vh] lg:px-[6vw] lg:py-[12vh]"
      >
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
            Scroll up to try different window presets, or upload your own photo.
            Open the settings panel to fine-tune threshold, contrast, and depth
            for each image.
          </p>
        </div>
      </motion.section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#1a1815]/10 px-6 py-12 lg:px-[6vw]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-xs text-[#8a8078]">
              WebGL + Vogel Disk Sampling
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
    </div>
  );
}
