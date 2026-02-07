"use client";

import Link from "next/link";
import { useControls, folder, button } from "leva";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Sample content to see shadows over ─── */
function SampleContent() {
  return (
    <div className="mx-auto max-w-4xl space-y-24 px-6 py-32 lg:px-16">
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
          Adjust the controls to tune the Vogel Disk Sampling shadow shader.
          Changes re-render the WebGL pipeline in real-time.
        </p>
      </div>

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

      <div className="rounded-3xl bg-[#1a1815] px-8 py-16 text-center">
        <h2 className="font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.5rem,4vw,3rem)] text-[#faf5f2]">
          Specifications
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-12">
          {[
            ['10.5"', "Display"],
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

      <div className="mx-auto max-w-2xl text-center">
        <blockquote className="font-[Georgia,_'Times_New_Roman',serif] text-[clamp(1.25rem,2.5vw,2rem)] leading-relaxed text-[#1a1815]">
          &ldquo;We believe your most important technology should not leave you
          feeling exhausted, distracted, or in pain.&rdquo;
        </blockquote>
      </div>
    </div>
  );
}

/* ─── WebGL Shadow Overlay with leva controls ─── */
function ControlledShadowOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const quadBufRef = useRef<WebGLBuffer | null>(null);
  const depthTexRef = useRef<WebGLTexture | null>(null);
  const [copied, setCopied] = useState(false);

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
    { collapsed: false }
  );

  const shadowColor = useControls(
    "Shadow Tint",
    {
      r: { value: 0.92, min: 0.5, max: 1.0, step: 0.01 },
      g: { value: 0.9, min: 0.5, max: 1.0, step: 0.01 },
      b: { value: 0.88, min: 0.5, max: 1.0, step: 0.01 },
    },
    { collapsed: true }
  );

  // ── Depth map (blind slats) parameters ──
  const blinds = useControls(
    "Blind Slats",
    {
      angle: { value: -35, min: -80, max: 0, step: 1 },
      slatWidth: { value: 5, min: 1, max: 20, step: 1 },
      slatSpacing: { value: 50, min: 15, max: 120, step: 1 },
      depthBase: { value: 0.3, min: 0.05, max: 0.9, step: 0.05 },
      depthVariation: { value: 0.08, min: 0, max: 0.3, step: 0.01 },
    },
    { collapsed: false }
  );

  const frame = useControls(
    "Window Frame",
    {
      enabled: true,
      depth: { value: 0.65, min: 0.1, max: 1.0, step: 0.05 },
      thickness: { value: 10, min: 2, max: 30, step: 1 },
      crossbar1Y: { value: -0.15, min: -0.5, max: 0.5, step: 0.05 },
      crossbar2Y: { value: 0.35, min: -0.5, max: 0.5, step: 0.05 },
      verticalBar: true,
    },
    { collapsed: true }
  );

  const rendering = useControls(
    "Rendering",
    {
      scale: { value: 0.33, min: 0.15, max: 1.0, step: 0.05 },
    },
    { collapsed: true }
  );

  // ── Export config ──
  const exportConfig = useCallback(() => {
    const config = { shader, shadowColor, blinds, frame, rendering };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shader, shadowColor, blinds, frame, rendering]);

  useControls("Export", {
    "Copy Config": button(() => exportConfig()),
  });

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
      const float diskSize = ${shader.diskSize.toFixed(1)};
      const int diskSamples = ${shader.diskSamples};
      const float minSize = ${shader.minSize.toFixed(1)};
      const float maxSize = ${shader.maxSize.toFixed(1)};
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

    // ─ Generate depth map ─
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(window.innerWidth * rendering.scale * dpr);
    const h = Math.round(window.innerHeight * rendering.scale * dpr);

    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);

    const depthCanvas = document.createElement("canvas");
    depthCanvas.width = w;
    depthCanvas.height = h;
    const ctx = depthCanvas.getContext("2d")!;

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, w, h);

    const angleRad = (blinds.angle * Math.PI) / 180;

    // Blind slats
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angleRad);

    const count = Math.ceil((Math.max(w, h) * 2) / blinds.slatSpacing);
    for (let i = -count; i <= count; i++) {
      const depth =
        blinds.depthBase +
        Math.sin(i * 1.37) * blinds.depthVariation +
        Math.cos(i * 0.73) * blinds.depthVariation * 0.6;
      const r = Math.round(Math.max(1, Math.min(255, depth * 255)));
      ctx.fillStyle = `rgb(${r}, 255, 0)`;
      ctx.fillRect(
        -w * 2,
        i * blinds.slatSpacing,
        w * 4,
        blinds.slatWidth
      );
    }
    ctx.restore();

    // Window frame
    if (frame.enabled) {
      const fd = Math.round(frame.depth * 255);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(angleRad);
      ctx.fillStyle = `rgb(${fd}, 255, 0)`;
      ctx.fillRect(-w * 2, h * frame.crossbar1Y, w * 4, frame.thickness);
      ctx.fillRect(-w * 2, h * frame.crossbar2Y, w * 4, frame.thickness);
      ctx.restore();

      if (frame.verticalBar) {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(angleRad + Math.PI / 2);
        ctx.fillStyle = `rgb(${fd}, 255, 0)`;
        ctx.fillRect(-w * 2, 0, w * 4, frame.thickness);
        ctx.restore();
      }
    }

    // ─ Upload depth texture ─
    if (depthTexRef.current) gl.deleteTexture(depthTexRef.current);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, depthCanvas);
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
  }, [shader, shadowColor, blinds, frame, rendering]);

  // ── Handle resize ──
  useEffect(() => {
    // The main effect above runs on control changes.
    // For resize, we trigger a re-render by forcing a state update.
    const onResize = () => {
      // Touch a control value to force re-render
      // Actually, just dispatch resize - the effect dependencies handle it
      window.dispatchEvent(new Event("leva-resize"));
    };
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
            href="/labs/daylight"
            className="text-xs text-[#8a8078] transition-colors hover:text-[#1a1815]"
          >
            &larr; back to daylight
          </Link>
          <span className="text-xs text-[#1a1815]/20">|</span>
          <span className="text-xs text-[#8a8078]">
            Shadow Playground — WebGL + Vogel Disk Sampling
          </span>
        </div>
      </nav>

      <SampleContent />
    </div>
  );
}
