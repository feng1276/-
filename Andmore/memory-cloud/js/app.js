/* ═══════════════════════════════════════════════════════════════
   🧠 MNEMOS Cloud — Application Controller
   DOM management, event bindings, UI state orchestration
   ═══════════════════════════════════════════════════════════════ */

console.log('[app.js] App module loading...');
const App = (() => {
  // ── State ──────────────────────────────────────────────────
  let selectedMemory = null;
  let allMemories = [];
  let filteredMemories = [];

  // ── DOM Refs ───────────────────────────────────────────────
  const dom = {};

  function cacheDom() {
    dom.statusBar = document.getElementById('status-bar');
    dom.memoryGrid = document.getElementById('memory-grid');
    dom.gridContainer = document.getElementById('memory-grid-container');
    dom.detailPanel = document.getElementById('detail-panel');
    dom.detailMain = document.getElementById('detail-main');
    dom.detailSidebar = document.getElementById('detail-sidebar');
    dom.sidebar = document.getElementById('sidebar');
    dom.searchInput = document.getElementById('search-input');
    dom.categoryList = document.getElementById('category-list');
    dom.tagCloud = document.getElementById('tag-cloud');
    dom.consoleOutput = document.getElementById('console-output');
    dom.footerBar = document.getElementById('footer-bar');
    dom.memoryCount = document.getElementById('memory-count');
    dom.filterIndicator = document.getElementById('filter-indicator');
    dom.brainwaveCanvas = document.getElementById('brainwaveCanvas');
    dom.analysisOverlay = document.getElementById('analysis-overlay');
    dom.modalOverlay = document.getElementById('modal-overlay');
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    cacheDom();

    // Load memory data
    if (typeof MEMORY_STORE !== 'undefined') {
      allMemories = MEMORY_STORE.memories || [];
    }
    filteredMemories = [...allMemories];

    // Initialize Visualizer
    if (typeof Visualizer !== 'undefined') {
      Visualizer.init();
    }

    // Render UI
    renderCategories();
    renderTagCloud();
    renderMemoryCards();
    renderDefaultDetail();
    updateStatusBar();
    updateMemoryCount();

    // Bind events
    bindEvents();

    // Update footer status
    updateFooter();
    setInterval(updateFooter, 5000);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // ── Event Bindings ─────────────────────────────────────────
  function bindEvents() {
    // Search
    if (dom.searchInput) {
      dom.searchInput.addEventListener('input', (e) => {
        SearchEngine.search(e.target.value);
        applyFilters();
      });
    }

    // Category clicks
    if (dom.categoryList) {
      dom.categoryList.addEventListener('click', (e) => {
        const item = e.target.closest('.category-item');
        if (!item) return;
        const catId = item.dataset.category;
        SearchEngine.setCategory(catId);
        renderCategories();
        applyFilters();
      });
    }

    // Tag clicks
    if (dom.tagCloud) {
      dom.tagCloud.addEventListener('click', (e) => {
        const chip = e.target.closest('.tag-chip');
        if (!chip) return;
        const tag = chip.dataset.tag;
        SearchEngine.setTag(tag);
        renderTagCloud();
        applyFilters();
      });
    }
  }

  // ── Filter Application ─────────────────────────────────────
  function applyFilters() {
    filteredMemories = SearchEngine.filter(allMemories);
    renderMemoryCards();
    updateMemoryCount();
    updateFilterIndicator();
  }

  // ── Render Categories ──────────────────────────────────────
  function renderCategories() {
    if (!dom.categoryList) return;
    const counts = SearchEngine.getCategoryCounts(allMemories);
    const state = SearchEngine.getState();

    const categories = [
      { id: 'all', name: '全部记忆', icon: '🧠', count: counts.all },
      { id: 'emotional', name: '情绪记忆', icon: '😊', count: counts.emotional || 0 },
      { id: 'personal', name: '人物记忆', icon: '👤', count: counts.personal || 0 },
      { id: 'event', name: '事件记忆', icon: '🌍', count: counts.event || 0 },
      { id: 'anomaly', name: '异常记忆', icon: '⚠️', count: counts.anomaly || 0 },
    ];

    dom.categoryList.innerHTML = categories.map(c => `
      <div class="category-item ${state.activeCategory === c.id ? 'active' : ''}" data-category="${c.id}">
        <span class="category-icon">${c.icon}</span>
        <span>${c.name}</span>
        <span class="category-count">${c.count}</span>
      </div>
    `).join('');
  }

  // ── Render Tag Cloud ───────────────────────────────────────
  function renderTagCloud() {
    if (!dom.tagCloud) return;
    const tags = SearchEngine.getAllTags(allMemories);
    const state = SearchEngine.getState();

    dom.tagCloud.innerHTML = tags.map(t => `
      <span class="tag-chip ${state.activeTag === t ? 'active' : ''}" data-tag="${t}">${t}</span>
    `).join('');
  }

  // ── Render Memory Cards ────────────────────────────────────
  function renderMemoryCards() {
    if (!dom.memoryGrid) return;

    if (filteredMemories.length === 0) {
      dom.memoryGrid.innerHTML = `
        <div class="grid-empty">
          <span>🔍 未找到匹配的记忆</span>
        </div>`;
      return;
    }

    dom.memoryGrid.innerHTML = filteredMemories.map(m => {
      const emotionLevel = m.emotionIntensity > 90 ? 'extreme' : m.emotionIntensity > 70 ? 'high' : m.emotionIntensity > 40 ? 'medium' : 'low';
      const isSelected = selectedMemory && selectedMemory.id === m.id;
      const isCorrupted = m.type === 'anomaly' && m.subcategory !== '系统日志异常';

      return `
      <div class="memory-card ${m.type} ${isSelected ? 'selected' : ''} ${isCorrupted ? 'corrupted' : ''} ${m.locked ? 'locked' : ''}"
           data-id="${m.id}"
           onclick="App.selectMemory('${m.id}')">
        <div class="card-header">
          <span class="card-id">${m.id}</span>
          <span class="card-type-badge ${m.type}">${m.category}</span>
        </div>
        <div class="card-title">${m.subcategory}</div>
        <div class="card-date">📅 ${m.timestamp?.split('T')[0] || '???'} | 📍 ${m.location?.split(',')[0] || '未知'}</div>
        <div class="card-keywords">
          ${(m.keywords || []).slice(0, 4).map(k => `<span class="card-keyword">${k}</span>`).join('')}
        </div>
        <div class="card-emotion-bar">
          <div class="card-emotion-fill ${emotionLevel}" style="width:${m.emotionIntensity}%"></div>
        </div>
        <div class="card-emotion-label">
          <span>情绪强度</span>
          <span style="color:${m.emotionIntensity > 85 ? 'var(--emotion-red)' : m.emotionIntensity > 60 ? 'var(--amber)' : 'var(--neon-blue)'}">${m.emotionIntensity}%</span>
        </div>
      </div>`;
    }).join('');
  }

  // ── Select Memory ──────────────────────────────────────────
  function selectMemory(memoryId) {
    const memory = allMemories.find(m => m.id === memoryId);
    if (!memory || memory.locked) return;

    selectedMemory = memory;
    renderMemoryCards();
    renderDetailPanel(memory);

    // Activate brainwave
    if (typeof Visualizer !== 'undefined') {
      Visualizer.setBrainwaveActive(true, memory.emotionIntensity);
    }

    // Emit neural sparks
    const card = document.querySelector(`.memory-card[data-id="${memoryId}"]`);
    if (card && typeof Visualizer !== 'undefined') {
      Visualizer.emitNeuralSparks(card, 12);
    }

    // Scroll detail into view if on mobile
    if (window.innerWidth <= 900) {
      dom.detailPanel?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ── Render Detail Panel ────────────────────────────────────
  function renderDetailPanel(memory) {
    if (!dom.detailMain || !dom.detailSidebar) return;

    const emotionLevel = memory.emotionIntensity > 90 ? 'level-5' : memory.emotionIntensity > 75 ? 'level-4' : memory.emotionIntensity > 60 ? 'level-3' : memory.emotionIntensity > 35 ? 'level-2' : 'level-1';
    const emotionLabel = memory.emotionIntensity > 90 ? 'extreme' : memory.emotionIntensity > 70 ? 'high' : 'medium';

    dom.detailMain.innerHTML = `
      <div class="detail-header">
        <div>
          <div class="detail-id">${memory.id}</div>
          <div class="detail-title">${memory.subcategory}</div>
        </div>
        <span class="card-type-badge ${memory.type}">${memory.category}</span>
      </div>

      <div class="detail-meta">
        <div class="meta-item">
          <span class="meta-label">时间</span>
          <span class="meta-value">${memory.timestamp || '???'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">地点</span>
          <span class="meta-value">${memory.location || '未知'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">情绪强度</span>
          <span class="meta-value emotion-gauge-value ${emotionLabel}">${memory.emotionIntensity}%</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">天气</span>
          <span class="meta-value">${getWeatherEmoji(memory.weather)} ${memory.weather || 'N/A'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">文件大小</span>
          <span class="meta-value">${memory.fileSize || 'N/A'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">访问次数</span>
          <span class="meta-value">${memory.accessCount || 0}</span>
        </div>
      </div>

      <div class="emotion-gauge">
        <div class="emotion-gauge-label">情绪强度指数</div>
        <div class="emotion-gauge-bar">
          <div class="emotion-gauge-fill ${emotionLevel}"></div>
        </div>
      </div>

      <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:4px;">
        <span style="font-size:9px;color:var(--cloud-white-faint);font-family:var(--font-mono);">🏷️</span>
        ${(memory.keywords || []).map(k => `<span class="card-keyword">${k}</span>`).join('')}
      </div>

      <div class="section-divider"></div>

      <div class="action-bar">
        <button class="action-btn primary" onclick="App.replayMemory()" title="回放记忆">
          <span class="btn-icon">▶</span> REPLAY
        </button>
        <button class="action-btn" onclick="App.quickReplay()" title="快速预览">
          <span class="btn-icon">⏩</span> QUICK
        </button>
        <button class="action-btn" onclick="App.analyzeMemory()" title="记忆分析">
          <span class="btn-icon">📊</span> ANALYZE
        </button>
        <button class="action-btn" onclick="App.encryptMemory()" title="加密存储">
          <span class="btn-icon">🔒</span> ENCRYPT
        </button>
        <button class="action-btn danger" onclick="App.confirmDelete()" title="删除记忆">
          <span class="btn-icon">🗑️</span> DELETE
        </button>
      </div>

      <div id="console-output" class="detail-console">
        <div class="console-line system">> 已选择记忆: ${memory.id} — ${memory.subcategory}</div>
        <div class="console-line success">> 就绪。点击 ▶ REPLAY 回放记忆叙事，或 ⏩ QUICK 快速预览</div>
      </div>
    `;

    dom.detailSidebar.innerHTML = `
      <div class="sidebar-title">🧬 神经签名</div>
      <div class="neural-sig">${memory.neuralSignature || 'N/A'}</div>

      <div class="section-divider"></div>

      <div class="sidebar-title">📊 存储信息</div>
      <div class="file-info-grid">
        <div class="file-info-item">
          <span class="file-info-label">文件大小</span>
          <span class="file-info-value">${memory.fileSize || 'N/A'}</span>
        </div>
        <div class="file-info-item">
          <span class="file-info-label">访问次数</span>
          <span class="file-info-value">${memory.accessCount || 0}</span>
        </div>
        <div class="file-info-item">
          <span class="file-info-label">状态</span>
          <span class="file-info-value">${memory.status === 'encrypted' ? '🔒 已加密' : memory.status === 'unlocked' ? '🔓 已解锁' : '⚠️ 异常'}</span>
        </div>
        <div class="file-info-item">
          <span class="file-info-label">最后访问</span>
          <span class="file-info-value">${memory.lastAccessed || 'N/A'}</span>
        </div>
      </div>

      ${memory.repairLog && memory.repairLog.length > 0 ? `
      <div class="section-divider"></div>
      <div class="sidebar-title">📋 维护记录</div>
      ${memory.repairLog.map(log => `
        <div style="margin-bottom:8px;font-size:10px;">
          <div style="color:var(--cloud-white-faint);">${log.date}</div>
          <div style="color:var(--cloud-white);">${log.action}: <span style="color:${log.result === 'SUCCESS' ? 'var(--synapse-green)' : log.result === 'REVIEW' ? 'var(--amber)' : 'var(--cloud-white-dim)'}">${log.result}</span></div>
          ${log.notes ? `<div style="color:var(--cloud-white-faint);font-size:9px;">${log.notes}</div>` : ''}
        </div>
      `).join('')}
      ` : ''}

      ${memory.diagnosticLog ? `
      <div class="section-divider"></div>
      <div class="sidebar-title">🔬 深度诊断</div>
      <pre style="font-size:9px;color:var(--emotion-red);white-space:pre-wrap;font-family:var(--font-mono);">${memory.diagnosticLog}</pre>
      ` : ''}
    `;

    // Re-query console element (recreated by innerHTML)
    dom.consoleOutput = document.getElementById('console-output');
    // Auto-scroll to show console (it's at the bottom of detail panel)
    if (dom.consoleOutput) {
      setTimeout(() => {
        dom.consoleOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }

  // ── Render Default Detail ──────────────────────────────────
  function renderDefaultDetail() {
    if (!dom.detailMain) return;
    dom.detailMain.innerHTML = `
      <div class="detail-empty">
        <div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🧠</div>
          <div>选择一个记忆卡片以查看详情</div>
          <div style="font-size:10px;color:var(--cloud-white-faint);margin-top:8px;">点击左侧记忆卡片 | 使用 ↑↓ 键导航 | Enter 回放</div>
        </div>
      </div>`;
    if (dom.detailSidebar) dom.detailSidebar.innerHTML = '<div class="detail-empty"><span>📊 选择记忆以查看分析</span></div>';
  }

  // ── Memory Actions ─────────────────────────────────────────
  function showConsole() {
    if (!dom.consoleOutput) return;
    dom.consoleOutput.style.display = 'block';
    // Flash effect to draw attention
    dom.consoleOutput.style.boxShadow = '0 0 20px var(--synapse-green-glow), 0 0 40px var(--synapse-green), inset 0 0 12px rgba(0,255,163,0.1)';
    setTimeout(() => {
      dom.consoleOutput.style.boxShadow = '';
    }, 600);
    // Auto-scroll to show console in the detail panel
    setTimeout(() => {
      dom.consoleOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }

  function hideConsole() {
    if (!dom.consoleOutput) return;
    dom.consoleOutput.style.display = 'none';
  }

  function replayMemory() {
    if (!selectedMemory) { showToast('请先选择一个记忆卡片', 'info'); return; }
    if (!dom.consoleOutput) return;
    if (MemoryEngine.isPlaying()) {
      MemoryEngine.stopPlayback();
      hideConsole();
      return;
    }

    showConsole();
    showToast('▶ 正在回放: ' + selectedMemory.subcategory, 'success');
    MemoryEngine.playMemory(selectedMemory, dom.consoleOutput, (memory) => {
      // Record replay for storyline
      if (typeof Storyline !== 'undefined') {
        const count = Storyline.recordReplay();
        updateFooter();
      }
      // Increment access count
      memory.accessCount = (memory.accessCount || 0) + 1;
      memory.lastAccessed = new Date().toISOString().split('T')[0];
      // Keep console visible then refresh detail
      setTimeout(hideConsole, 4000);
      setTimeout(() => renderDetailPanel(memory), 4200);
    });

    // Pulse the replay button
    const replayBtn = document.querySelector('.action-btn.primary');
    if (replayBtn) {
      replayBtn.style.animation = 'synapticFire 0.6s ease';
      setTimeout(() => { replayBtn.style.animation = ''; }, 600);
    }
  }

  function quickReplay() {
    if (!selectedMemory) { showToast('请先选择一个记忆卡片', 'info'); return; }
    if (!dom.consoleOutput) return;
    showConsole();
    MemoryEngine.quickPlayback(selectedMemory, dom.consoleOutput, (memory) => {
      memory.accessCount = (memory.accessCount || 0) + 1;
      setTimeout(hideConsole, 3000);
      setTimeout(() => renderDetailPanel(memory), 3200);
    });
  }

  function analyzeMemory() {
    if (!selectedMemory) { showToast('请先选择一个记忆卡片', 'info'); return; }
    const overlay = dom.analysisOverlay;
    if (!overlay) return;
    overlay.classList.add('active');

    // Draw radar chart
    setTimeout(() => {
      const canvas = overlay.querySelector('canvas');
      if (canvas && typeof Visualizer !== 'undefined') {
        Visualizer.drawAnalysisRadar(canvas, [
          selectedMemory.emotionIntensity || 50,
          Math.random() * 40 + 50,
          Math.random() * 30 + 60,
          Math.random() * 50 + 30,
          Math.random() * 30 + 65,
          Math.random() * 40 + 45,
        ]);
      }
    }, 200);
  }

  function closeAnalysis() {
    if (dom.analysisOverlay) dom.analysisOverlay.classList.remove('active');
  }

  function encryptMemory() {
    if (!selectedMemory) { showToast('请先选择一个记忆卡片', 'info'); return; }
    if (!dom.consoleOutput) return;
    showConsole();
    MemoryEngine.simulateEncrypt(selectedMemory, dom.consoleOutput, (memory) => {
      memory.status = 'encrypted';
      setTimeout(hideConsole, 3000);
      setTimeout(() => renderDetailPanel(memory), 3200);
    });
  }

  function confirmDelete() {
    if (!selectedMemory) { showToast('请先选择一个记忆卡片', 'info'); return; }
    const modal = dom.modalOverlay;
    if (!modal) return;

    document.getElementById('modal-title-text').textContent = `删除记忆: ${selectedMemory.id}`;
    document.getElementById('modal-body-text').textContent = `你确定要删除 "${selectedMemory.subcategory}" 吗？此操作不可逆。记忆将在30天后从所有备份中永久清除。`;
    modal.classList.add('active');

    // Store callback
    modal._confirmAction = () => {
      modal.classList.remove('active');
      showConsole();
      MemoryEngine.simulateDelete(selectedMemory, dom.consoleOutput, (memory) => {
        // Remove from list
        allMemories = allMemories.filter(m => m.id !== memory.id);
        selectedMemory = null;
        applyFilters();
        renderDefaultDetail();
        dom.consoleOutput = null;
        if (typeof Visualizer !== 'undefined') {
          Visualizer.setBrainwaveActive(false, 0);
        }
        updateStatusBar();

        // Toast
        showToast(`记忆 ${memory.id} 已删除`, 'warning');

        // Screen shake
        document.body.style.animation = 'screenShake 0.4s ease-out';
        setTimeout(() => { document.body.style.animation = ''; }, 400);
      });
    };
  }

  function confirmModalDelete() {
    if (dom.modalOverlay && dom.modalOverlay._confirmAction) {
      dom.modalOverlay._confirmAction();
    }
  }

  function closeModal() {
    if (dom.modalOverlay) dom.modalOverlay.classList.remove('active');
  }

  // ── Toast ──────────────────────────────────────────────────
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ── Status Bar Updates ─────────────────────────────────────
  function updateStatusBar() {
    const stability = Math.floor(95 - (allMemories.filter(m => m.type === 'anomaly').length * 3) + Math.random() * 5);
    const synapseLoad = Math.floor(25 + allMemories.filter(m => m.type === 'anomaly').length * 4 + Math.random() * 10);

    updateStatusValue('stat-stability', `${stability}%`, stability > 85 ? 'good' : stability > 65 ? 'warning' : 'critical');
    updateStatusValue('stat-anomalies', allMemories.filter(m => m.type === 'anomaly').length, allMemories.filter(m => m.type === 'anomaly').length > 5 ? 'critical' : 'warning');
    updateStatusValue('stat-load', `${synapseLoad}%`, synapseLoad > 70 ? 'warning' : 'good');
  }

  function updateStatusValue(id, value, cls = '') {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
      el.className = 'status-value ' + cls;
    }
  }

  function updateFooter() {
    const el = document.getElementById('footer-replays');
    if (el && typeof Storyline !== 'undefined') {
      const progress = Storyline.getProgress();
      el.textContent = `${progress.totalReplays} | ${progress.unlockedCount}/4 已解锁`;
    }
  }

  function updateMemoryCount() {
    if (dom.memoryCount) {
      dom.memoryCount.textContent = `显示 ${filteredMemories.length} / ${allMemories.length} 条记忆`;
    }
  }

  function updateFilterIndicator() {
    if (!dom.filterIndicator) return;
    const state = SearchEngine.getState();
    const hasFilter = state.activeCategory !== 'all' || state.activeTag || state.searchQuery;
    dom.filterIndicator.classList.toggle('visible', hasFilter);

    let text = '筛选: ';
    if (state.activeCategory !== 'all') text += `分类=${state.activeCategory} `;
    if (state.activeTag) text += `标签=${state.activeTag} `;
    if (state.searchQuery) text += `搜索="${state.searchQuery}" `;
    dom.filterIndicator.textContent = text;
  }

  // ── Keyboard Navigation ────────────────────────────────────
  function handleKeyboard(e) {
    // Don't capture if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case '1': SearchEngine.setCategory('all'); renderCategories(); applyFilters(); break;
      case '2': SearchEngine.setCategory('emotional'); renderCategories(); applyFilters(); break;
      case '3': SearchEngine.setCategory('personal'); renderCategories(); applyFilters(); break;
      case '4': SearchEngine.setCategory('event'); renderCategories(); applyFilters(); break;
      case '5': SearchEngine.setCategory('anomaly'); renderCategories(); applyFilters(); break;
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        if (!selectedMemory && filteredMemories.length > 0) {
          selectMemory(filteredMemories[0].id);
        } else {
          navigateCards(e.key === 'ArrowUp' ? -1 : 1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (!selectedMemory) { showToast('请先用 ↑↓ 键选择一条记忆', 'info'); }
        else replayMemory();
        break;
      case 'Escape':
        closeModal();
        closeAnalysis();
        hideConsole();
        break;
      case 'r':
      case 'R':
        if (!e.ctrlKey && !e.metaKey) replayMemory();
        break;
      case 'f':
      case 'F':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          dom.searchInput?.focus();
        }
        break;
    }
  }

  function navigateCards(direction) {
    if (filteredMemories.length === 0) return;
    let currentIndex = selectedMemory ? filteredMemories.findIndex(m => m.id === selectedMemory.id) : -1;
    let newIndex;
    if (currentIndex === -1) {
      newIndex = direction > 0 ? 0 : filteredMemories.length - 1;
    } else {
      newIndex = (currentIndex + direction + filteredMemories.length) % filteredMemories.length;
    }
    selectMemory(filteredMemories[newIndex].id);
  }

  // ── Utilities ──────────────────────────────────────────────
  function getWeatherEmoji(weather) {
    const map = { 'rain': '🌧️', 'sunny': '☀️', 'clear': '🌙', 'cloudy': '☁️', 'snow': '❄️', 'mixed': '🌤️', 'unknown': '❓' };
    return map[weather] || '🌤️';
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    init,
    selectMemory,
    replayMemory,
    quickReplay,
    analyzeMemory,
    closeAnalysis,
    encryptMemory,
    confirmDelete,
    confirmModalDelete,
    closeModal,
  };
})();

// Expose to window for inline onclick handlers (some browsers
// don't resolve const bindings in event handler scope)
window.App = App;

// ── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
