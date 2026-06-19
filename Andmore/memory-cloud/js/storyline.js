/* ═══════════════════════════════════════════════════════════════
   🧠 MNEMOS Cloud — Hidden Storyline System
   Progressive revelation of the memory cloud's dark secrets
   ═══════════════════════════════════════════════════════════════ */

const Storyline = (() => {
  let totalReplays = 0;
  let unlockedLayers = new Set();
  let secretLogVisible = false;

  // ── Record a memory replay ─────────────────────────────────
  function recordReplay() {
    totalReplays++;
    checkUnlocks();
    return totalReplays;
  }

  // ── Check for new layer unlocks ────────────────────────────
  function checkUnlocks() {
    const thresholds = [
      { layer: 1, threshold: 5 },
      { layer: 2, threshold: 12 },
      { layer: 3, threshold: 20 },
      { layer: 4, threshold: 30 },
    ];

    for (const t of thresholds) {
      if (totalReplays >= t.threshold && !unlockedLayers.has(t.layer)) {
        unlockedLayers.add(t.layer);
        showLayerUnlock(t.layer, t.threshold);
      }
    }
  }

  // ── Show layer unlock notification ─────────────────────────
  function showLayerUnlock(layer, threshold) {
    const storyData = MEMORY_STORE?.hiddenStoryline?.[`layer${layer}`];
    if (!storyData) return;

    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'system-log-toast';
    toast.innerHTML = `
      <div style="font-size:10px;color:var(--cloud-white-faint);margin-bottom:4px;">🔓 系统日志解锁</div>
      <div style="font-weight:600;">${storyData.title}</div>
      <div style="font-size:10px;color:var(--cloud-white-faint);margin-top:4px;">点击查看 →</div>
    `;
    toast.style.cursor = 'pointer';
    toast.addEventListener('click', () => {
      toast.remove();
      showSecretLog(layer);
    });
    document.body.appendChild(toast);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 8000);

    // Flash glitch effect
    flashGlitch();
  }

  // ── Show secret log overlay ────────────────────────────────
  function showSecretLog(layer) {
    const storyData = MEMORY_STORE?.hiddenStoryline?.[`layer${layer}`];
    if (!storyData) return;

    // Remove existing overlay if any
    const existing = document.querySelector('.secret-log-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'secret-log-overlay active';
    overlay.innerHTML = `
      <div class="secret-log-title">⚠ ${storyData.title}</div>
      <div class="secret-log-body">${storyData.content}</div>
      <button class="secret-log-close" onclick="this.closest('.secret-log-overlay').remove()">
        [ CLOSE CLASSIFIED FILE ]
      </button>
    `;
    document.body.appendChild(overlay);

    // Close on Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    secretLogVisible = true;
    overlay.addEventListener('transitionend', () => {
      if (!overlay.classList.contains('active')) {
        overlay.remove();
        secretLogVisible = false;
      }
    });
  }

  // ── Flash glitch effect ────────────────────────────────────
  function flashGlitch() {
    const flash = document.getElementById('glitch-flash');
    if (!flash) return;

    flash.style.opacity = '1';
    // Trigger screen shake briefly
    document.body.style.animation = 'screenShake 0.3s ease-out';
    setTimeout(() => {
      flash.style.opacity = '0';
      document.body.style.animation = '';
    }, 300);
  }

  // ── Get unlock progress ────────────────────────────────────
  function getProgress() {
    return {
      totalReplays,
      unlockedCount: unlockedLayers.size,
      totalLayers: 4,
      nextThreshold: (() => {
        const thresholds = [5, 12, 20, 30];
        for (const t of thresholds) {
          if (totalReplays < t) return t;
        }
        return null; // All unlocked
      })(),
    };
  }

  // ── Reset (for testing) ────────────────────────────────────
  function reset() {
    totalReplays = 0;
    unlockedLayers = new Set();
    secretLogVisible = false;
  }

  return {
    recordReplay,
    showSecretLog,
    getProgress,
    reset,
  };
})();
