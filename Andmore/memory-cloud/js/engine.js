/* ═══════════════════════════════════════════════════════════════
   🧠 MNEMOS Cloud — Memory Playback Engine
   Typewriter console output, neural simulation, emotion effects
   ═══════════════════════════════════════════════════════════════ */

console.log("[engine.js] MemoryEngine module loaded");
const MemoryEngine = (() => {
  let isPlaying = false;
  let playbackTimer = null;
  let currentMemory = null;

  // ── Typewriter effect with variable speed ──────────────────
  function typewriteText(text, targetEl, speed = 35, onComplete = null) {
    let index = 0;
    targetEl.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'console-cursor';
    targetEl.appendChild(cursor);

    function type() {
      if (index < text.length) {
        const char = text[index];
        // Variable speed based on punctuation
        let delay = speed;
        if ('，。！？；：、'.includes(char)) delay = speed * 2.5;
        else if ('\n'.includes(char)) delay = speed * 1.8;
        else if ('—…“”‘’'.includes(char)) delay = speed * 1.3;

        // Insert before cursor
        const textNode = document.createTextNode(char);
        targetEl.insertBefore(textNode, cursor);

        // Auto scroll
        targetEl.scrollTop = targetEl.scrollHeight;

        index++;
        playbackTimer = setTimeout(type, delay);
      } else {
        // Remove cursor after finishing
        if (cursor) cursor.remove();
        isPlaying = false;
        if (onComplete) onComplete();
      }
    }
    type();
  }

  // ── Console log line (system style) ────────────────────────
  function consoleLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `console-line ${className}`;
    line.textContent = text;
    return line;
  }

  // ── Stop playback ──────────────────────────────────────────
  function stopPlayback() {
    if (playbackTimer) {
      clearTimeout(playbackTimer);
      playbackTimer = null;
    }
    isPlaying = false;
    currentMemory = null;
  }

  // ── Main playback sequence ─────────────────────────────────
  function playMemory(memory, consoleEl, onComplete = null) {
    if (isPlaying) stopPlayback();

    isPlaying = true;
    currentMemory = memory;
    consoleEl.innerHTML = '';

    // Show narrative preview IMMEDIATELY so user sees feedback
    const preview = document.createElement('div');
    preview.style.cssText = 'color:#FFD700;font-size:12px;margin-bottom:10px;padding:8px;background:rgba(255,215,0,0.08);border-left:3px solid #FFD700;border-radius:0 4px 4px 0;white-space:pre-wrap;max-height:120px;overflow:hidden;';
    preview.textContent = '📖 ' + (memory.narrative || '(无叙事文本)').slice(0, 250) + '...';
    consoleEl.appendChild(preview);

    const lines = [
      { text: `> 初始化记忆回放引擎 v4.7.1...`, cls: 'system', delay: 80 },
      { text: `> 读取记忆记录: ${memory.id}`, cls: 'system', delay: 60 },
      { text: `> 记忆类型: ${memory.category} | 情绪强度: ${memory.emotionIntensity}%`, cls: 'system', delay: 80 },
      { text: `> 神经签名验证通过`, cls: 'system', delay: 60 },
      { text: `> 重建感官数据层...`, cls: 'neural', delay: 80 },
      { text: `> 回放准备完成。开始回放...`, cls: 'success', delay: 100 },
      { text: ``, cls: '', delay: 150 },
      { text: `📍 ${memory.location || 'Unknown'} | 🕐 ${memory.timestamp || 'Unknown'}`, cls: 'system', delay: 80 },
      { text: `🌤️ ${memory.weather || 'Unknown'} | 🏷️ ${(memory.keywords || []).join(' / ')}`, cls: 'system', delay: 80 },
      { text: ``, cls: '', delay: 200 },
    ];

    // Animate system lines first
    let lineIndex = 0;
    function showNextLine() {
      if (lineIndex < lines.length) {
        const l = lines[lineIndex];
        const el = consoleLine(l.text, l.cls);
        consoleEl.appendChild(el);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        lineIndex++;
        playbackTimer = setTimeout(showNextLine, l.delay);
      } else {
        // Start narrative typewriter
        const narrativeDiv = document.createElement('div');
        narrativeDiv.className = 'playback-line memory';
        consoleEl.appendChild(narrativeDiv);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        typewriteText(memory.narrative, narrativeDiv, 28, () => {
          // Playback complete
          const endLine = consoleLine('> ── Memory playback complete ──', 'success');
          consoleEl.appendChild(endLine);
          consoleEl.scrollTop = consoleEl.scrollHeight;
          currentMemory = null;
          if (onComplete) onComplete(memory);
        });
      }
    }

    playbackTimer = setTimeout(showNextLine, 150);
  }

  // ── Quick playback (shorter, no typewriter) ────────────────
  function quickPlayback(memory, consoleEl, onComplete = null) {
    if (isPlaying) stopPlayback();
    isPlaying = true;
    currentMemory = memory;
    consoleEl.innerHTML = '';

    const lines = [
      { text: `> Quick-accessing ${memory.id}: ${memory.subcategory}`, cls: 'system' },
      { text: `> Neural signature: ${memory.neuralSignature || 'N/A'}`, cls: 'system' },
      { text: `> Emotion intensity: ${memory.emotionIntensity}% [${'█'.repeat(Math.round(memory.emotionIntensity / 10))}${'░'.repeat(10 - Math.round(memory.emotionIntensity / 10))}]`, cls: memory.emotionIntensity > 85 ? 'warning' : 'neural' },
    ];

    lines.forEach(l => {
      const el = consoleLine(l.text, l.cls);
      consoleEl.appendChild(el);
    });

    // Show first 300 chars of narrative
    const preview = memory.narrative.slice(0, 300) + '...';
    const previewEl = consoleLine(preview, 'memory');
    consoleEl.appendChild(previewEl);

    const endLine = consoleLine('> ── Quick access complete ──', 'success');
    consoleEl.appendChild(endLine);
    consoleEl.scrollTop = consoleEl.scrollHeight;

    isPlaying = false;
    currentMemory = null;
    if (onComplete) onComplete(memory);
  }

  // ── Delete simulation ──────────────────────────────────────
  function simulateDelete(memory, consoleEl, onComplete = null) {
    if (isPlaying) stopPlayback();
    isPlaying = true;
    consoleEl.innerHTML = '';

    const lines = [
      { text: `⚠️  INITIATING MEMORY DELETION PROTOCOL`, cls: 'error', delay: 200 },
      { text: `> Target: ${memory.id} — ${memory.subcategory}`, cls: 'system', delay: 300 },
      { text: `> Warning: This operation is irreversible.`, cls: 'error', delay: 350 },
      { text: `> Encrypting memory for final backup...`, cls: 'system', delay: 250 },
      { text: `> Severing neural connections...`, cls: 'warning', delay: 400 },
      { text: `> Wiping sensory data layers...`, cls: 'warning', delay: 300 },
      { text: `> ${memory.id} deleted from cloud storage.`, cls: 'error', delay: 200 },
      { text: ``, cls: '', delay: 600 },
      { text: `> Memory irretrievably deleted.`, cls: 'system', delay: 200 },
      { text: `> ${memory.id} will persist in local cache for 30 days before permanent removal.`, cls: 'system', delay: 250 },
    ];

    let i = 0;
    function next() {
      if (i < lines.length) {
        const el = consoleLine(lines[i].text, lines[i].cls);
        consoleEl.appendChild(el);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        i++;
        playbackTimer = setTimeout(next, lines[i-1]?.delay || 250);
      } else {
        isPlaying = false;
        if (onComplete) onComplete(memory);
      }
    }
    next();
  }

  // ── Encrypt simulation ─────────────────────────────────────
  function simulateEncrypt(memory, consoleEl, onComplete = null) {
    if (isPlaying) stopPlayback();
    isPlaying = true;
    consoleEl.innerHTML = '';

    const lines = [
      { text: `🔒 ENCRYPTING MEMORY: ${memory.id}`, cls: 'system', delay: 200 },
      { text: `> Generating 4096-bit quantum encryption key...`, cls: 'neural', delay: 300 },
      { text: `> Key generated: ${'*'.repeat(64)}`, cls: 'neural', delay: 200 },
      { text: `> Encrypting visual layer... DONE`, cls: 'system', delay: 250 },
      { text: `> Encrypting auditory layer... DONE`, cls: 'system', delay: 250 },
      { text: `> Encrypting emotional metadata... DONE`, cls: 'system', delay: 250 },
      { text: `> Memory ${memory.id} securely encrypted.`, cls: 'success', delay: 200 },
    ];

    let i = 0;
    function next() {
      if (i < lines.length) {
        const el = consoleLine(lines[i].text, lines[i].cls);
        consoleEl.appendChild(el);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        i++;
        playbackTimer = setTimeout(next, lines[i-1]?.delay || 200);
      } else {
        isPlaying = false;
        if (onComplete) onComplete(memory);
      }
    }
    next();
  }

  return {
    playMemory,
    quickPlayback,
    simulateDelete,
    simulateEncrypt,
    stopPlayback,
    isPlaying: () => isPlaying,
  };
})();
