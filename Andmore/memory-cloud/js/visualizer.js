/* ═══════════════════════════════════════════════════════════════
   🧠 MNEMOS Cloud — Visualizer Engine
   Canvas-based cloud particles, brain waves, and neural sparks
   ═══════════════════════════════════════════════════════════════ */

const Visualizer = (() => {
  // ── Cloud Particle System ──────────────────────────────────
  let cloudCtx, cloudCanvas;
  let particles = [];
  const PARTICLE_COUNT = 80;

  function initCloudCanvas() {
    cloudCanvas = document.getElementById('cloudCanvas');
    if (!cloudCanvas) return;
    cloudCtx = cloudCanvas.getContext('2d');
    resizeCloudCanvas();
    window.addEventListener('resize', resizeCloudCanvas);
    spawnParticles();
    requestAnimationFrame(animateCloud);
  }

  function resizeCloudCanvas() {
    if (!cloudCanvas) return;
    cloudCanvas.width = window.innerWidth;
    cloudCanvas.height = window.innerHeight;
  }

  function spawnParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true));
    }
  }

  function createParticle(randomY = false) {
    return {
      x: Math.random() * (cloudCanvas?.width || 1920),
      y: randomY ? Math.random() * (cloudCanvas?.height || 1080) : (cloudCanvas?.height || 1080) + 10,
      radius: Math.random() * 2.5 + 0.8,
      speedY: Math.random() * 0.3 + 0.08,
      speedX: Math.random() * 0.15 - 0.075,
      opacity: Math.random() * 0.25 + 0.04,
      wobbleAmp: Math.random() * 0.4 + 0.1,
      wobbleFreq: Math.random() * 0.008 + 0.003,
      wobbleOffset: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7
        ? `rgba(168, 85, 247, ${Math.random() * 0.3 + 0.05})`
        : `rgba(77, 163, 255, ${Math.random() * 0.25 + 0.04})`,
    };
  }

  function animateCloud(timestamp) {
    if (!cloudCtx || !cloudCanvas) return;
    cloudCtx.clearRect(0, 0, cloudCanvas.width, cloudCanvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y -= p.speedY;
      p.x += Math.sin(timestamp * p.wobbleFreq + p.wobbleOffset) * p.wobbleAmp;

      // Draw particle with glow
      cloudCtx.beginPath();
      cloudCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      cloudCtx.fillStyle = p.color;
      cloudCtx.fill();

      // Occasional glow halo for larger particles
      if (p.radius > 1.8) {
        cloudCtx.beginPath();
        cloudCtx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        cloudCtx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity * 0.3})`);
        cloudCtx.fill();
      }

      // Reset if off-screen
      if (p.y < -20 || p.x < -20 || p.x > cloudCanvas.width + 20) {
        particles[i] = createParticle(false);
        particles[i].y = cloudCanvas.height + 15;
      }
    }
    requestAnimationFrame(animateCloud);
  }

  // ── Brain Wave Oscilloscope ────────────────────────────────
  let brainwaveCtx, brainwaveCanvas;
  let brainwaveActive = false;
  let brainwaveTime = 0;
  let brainwaveIntensity = 50; // 0-100, controls amplitude/frequency
  let brainwaveData = [];

  function initBrainwaveCanvas() {
    brainwaveCanvas = document.getElementById('brainwaveCanvas');
    if (!brainwaveCanvas) return;
    brainwaveCtx = brainwaveCanvas.getContext('2d');
    resizeBrainwaveCanvas();
    window.addEventListener('resize', resizeBrainwaveCanvas);
    requestAnimationFrame(animateBrainwave);
  }

  function resizeBrainwaveCanvas() {
    if (!brainwaveCanvas) return;
    const parent = brainwaveCanvas.parentElement;
    if (parent) {
      brainwaveCanvas.width = parent.clientWidth;
      brainwaveCanvas.height = parent.clientHeight;
    }
  }

  function setBrainwaveActive(active, intensity = 50) {
    brainwaveActive = active;
    brainwaveIntensity = intensity;
    if (brainwaveCanvas) {
      brainwaveCanvas.classList.toggle('active', active);
    }
  }

  function animateBrainwave(timestamp) {
    if (!brainwaveCtx || !brainwaveCanvas) {
      requestAnimationFrame(animateBrainwave);
      return;
    }
    const w = brainwaveCanvas.width;
    const h = brainwaveCanvas.height;
    brainwaveCtx.clearRect(0, 0, w, h);

    if (brainwaveActive) {
      brainwaveTime += 0.016;
      const amp = (brainwaveIntensity / 100) * h * 0.35;
      const freq = 1.5 + (brainwaveIntensity / 100) * 2.5;

      // Draw multiple overlapping waves
      const colors = [
        `rgba(77, 163, 255, 0.5)`,
        `rgba(168, 85, 247, 0.35)`,
        `rgba(0, 255, 163, 0.25)`,
      ];

      for (let layer = 0; layer < 3; layer++) {
        brainwaveCtx.beginPath();
        brainwaveCtx.strokeStyle = colors[layer];
        brainwaveCtx.lineWidth = 1.5 - layer * 0.3;
        const phaseShift = layer * 0.8;

        for (let x = 0; x < w; x += 1) {
          const t = x / w;
          const y = h / 2 +
            Math.sin(t * freq * Math.PI * 3 + brainwaveTime * 2 + phaseShift) * amp * (1 - layer * 0.25) +
            Math.sin(t * freq * Math.PI * 1.7 + brainwaveTime * 1.3 + phaseShift) * amp * 0.4 +
            Math.sin(t * freq * Math.PI * 0.5 + brainwaveTime * 0.7 + phaseShift) * amp * 0.2;

          if (x === 0) brainwaveCtx.moveTo(x, y);
          else brainwaveCtx.lineTo(x, y);
        }
        brainwaveCtx.stroke();
      }

      // Glow dots at wave peaks
      for (let i = 0; i < 5; i++) {
        const x = w * (0.1 + i * 0.2);
        const t = x / w;
        const y = h / 2 + Math.sin(t * freq * Math.PI * 3 + brainwaveTime * 2) * amp;
        brainwaveCtx.beginPath();
        brainwaveCtx.arc(x, y, 3, 0, Math.PI * 2);
        brainwaveCtx.fillStyle = 'rgba(77, 163, 255, 0.8)';
        brainwaveCtx.fill();
        brainwaveCtx.beginPath();
        brainwaveCtx.arc(x, y, 8, 0, Math.PI * 2);
        brainwaveCtx.fillStyle = 'rgba(77, 163, 255, 0.15)';
        brainwaveCtx.fill();
      }
    }
    requestAnimationFrame(animateBrainwave);
  }

  // ── Neural Spark Burst ─────────────────────────────────────
  function emitNeuralSparks(container, count = 15) {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${Math.random() > 0.5 ? 'var(--neon-blue)' : 'var(--memory-purple)'};
        pointer-events: none;
        z-index: 100;
        --px: ${(Math.random() - 0.5) * 120}px;
        --py: ${(Math.random() - 0.5) * 120}px;
        animation: particleBurst 0.6s ease-out forwards;
      `;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 700);
    }
  }

  // ── Analysis Radar Chart ───────────────────────────────────
  function drawAnalysisRadar(canvas, data) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.35;

    ctx.clearRect(0, 0, w, h);

    const labels = ['情感强度', '视觉清晰度', '听觉完整度', '嗅觉关联', '叙事连贯性', '时间准确性'];
    const values = data || [75, 60, 85, 45, 90, 70];
    const angles = labels.map((_, i) => (Math.PI * 2 / labels.length) * i - Math.PI / 2);

    // Grid
    for (let level = 1; level <= 5; level++) {
      ctx.beginPath();
      for (let i = 0; i < angles.length; i++) {
        const x = cx + Math.cos(angles[i]) * r * (level / 5);
        const y = cy + Math.sin(angles[i]) * r * (level / 5);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(77, 163, 255, ${0.1 + level * 0.03})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < angles.length; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angles[i]) * r, cy + Math.sin(angles[i]) * r);
      ctx.strokeStyle = 'rgba(77, 163, 255, 0.2)';
      ctx.stroke();

      // Label
      const lx = cx + Math.cos(angles[i]) * (r + 22);
      const ly = cy + Math.sin(angles[i]) * (r + 22);
      ctx.fillStyle = '#8899BB';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], lx, ly);
    }

    // Data polygon
    ctx.beginPath();
    for (let i = 0; i < values.length; i++) {
      const x = cx + Math.cos(angles[i]) * r * (values[i] / 100);
      const y = cy + Math.sin(angles[i]) * r * (values[i] / 100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Data points
    for (let i = 0; i < values.length; i++) {
      const x = cx + Math.cos(angles[i]) * r * (values[i] / 100);
      const y = cy + Math.sin(angles[i]) * r * (values[i] / 100);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#A855F7';
      ctx.fill();
    }
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    initCloudCanvas();
    initBrainwaveCanvas();
  }

  return {
    init,
    setBrainwaveActive,
    emitNeuralSparks,
    drawAnalysisRadar,
  };
})();
